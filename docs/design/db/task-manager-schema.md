# Task Manager用データベース設計

## 背景と要件
- `ts/web/src/components/task-manager.tsx` はタスク一覧を表示し、ステータス別タブ、検索、タグ、期日、優先度を扱う。
- 将来的に Notion 風のプロパティ設定やフィルタ拡張を期待しており、拡張しやすいスキーマが必要。
- Supabase (Postgres) を前提にし、行レベルセキュリティと UUID v7 を利用した一意キー管理を行う。UUID はバックエンド（Go）側で生成する。

## 設計概要
- **Enum 型**: `task_status_type`（not_started/in_progress/completed）、`task_priority_type`（low/medium/high）。
- **コアテーブル**:
  - `workspaces`: 複数組織/チームの多重入居を許容。
  - `tasks`: タスク本体。ステータス、優先度、期日、作成/更新者を保持。
  - `tags`: ワークスペース共通のタグマスタ。
  - `task_tags`: タスクとタグの多対多関連。
- **ビュー**: `task_effective_status_view` で UI の「期限超過」を計算列として提供。
- **インデックス/制約**: ステータス、期日、検索用の GIN/BTREE を配置し、UI 実装のフィルタや検索に対応。
- **ID 戦略**: ID はバックエンド（Go）で UUID v7 を生成し、全テーブルに採用。時系列ソート効率と分散生成時の衝突回避を両立する。DB 側で生成したい場合は `pg_uuidv7` 拡張を有効化し `uuid_generate_v7()` を利用する。

## Enum 定義

```sql
create type task_status_type as enum ('not_started', 'in_progress', 'completed');

create type task_priority_type as enum ('low', 'medium', 'high');
```

## テーブル詳細

### workspaces

| 列名 | 型 | Not Null | 既定値 | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | ✅ |  | ワークスペースID（Go サーバーで UUID v7 を生成） |
| name | text | ✅ |  | 表示名 |
| created_at | timestamptz | ✅ | now() | 作成日時 |
| updated_at | timestamptz | ✅ | now() | 更新日時（トリガーで更新） |

### tasks

| 列名 | 型 | Not Null | 既定値 | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | ✅ |  | タスクID（Go サーバーで UUID v7 を生成） |
| workspace_id | uuid | ✅ |  | `workspaces.id` への外部キー |
| title | text | ✅ |  | タスク名（UI の主要表示） |
| description | text |  |  | タスク詳細（UI 拡張用） |
| status | task_status_type | ✅ | 'not_started'::task_status_type | ワークフロー上の状態 |
| priority | task_priority_type |  |  | 優先度。未指定は `NULL` |
| due_at | timestamptz |  |  | 期日（UI 上は日付表示だが、時刻付きで保持） |
| completed_at | timestamptz |  |  | 完了日時（ステータス遷移の監査用） |
| created_by | uuid |  |  | 作成ユーザー（Supabase Auth の `auth.users` を想定） |
| updated_by | uuid |  |  | 最終更新者 |
| created_at | timestamptz | ✅ | now() | レコード作成日時 |
| updated_at | timestamptz | ✅ | now() | レコード更新日時（トリガーで更新） |
| search_vector | tsvector | ✅ | to_tsvector('japanese', coalesce(title, '') || ' ' || coalesce(description, '')) | タイトル/説明全文検索用 |

**制約・インデックス**
- `foreign key (workspace_id) references workspaces(id) on delete cascade`
- `check (status <> 'completed' or completed_at is not null)` で整合性を担保。
- `index tasks_workspace_status_idx on tasks(workspace_id, status)`
- `index tasks_workspace_due_idx on tasks(workspace_id, due_at desc nulls last)`
- `index tasks_search_idx on tasks using gin (search_vector)`

### tags

| 列名 | 型 | Not Null | 既定値 | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | ✅ |  | タグID（Go サーバーで UUID v7 を生成） |
| workspace_id | uuid | ✅ |  | `workspaces.id` への外部キー |
| label | text | ✅ |  | タグ表示名（UI のバッジ文字列） |
| color | text |  |  | UI 表示色（Tailwind クラス等を保持） |
| created_at | timestamptz | ✅ | now() | 作成日時 |
| updated_at | timestamptz | ✅ | now() | 更新日時 |

ユニーク制約: `unique (workspace_id, label)` で重複タグ名を禁止。

### task_tags

| 列名 | 型 | Not Null | 既定値 | 説明 |
| --- | --- | --- | --- | --- |
| task_id | uuid | ✅ |  | `tasks.id` への外部キー |
| tag_id | uuid | ✅ |  | `tags.id` への外部キー |
| added_at | timestamptz | ✅ | now() | 付与日時 |

複合主キー: `primary key (task_id, tag_id)`。

## ビュー

UI 上の「期限超過」は `status` と `due_at` の組み合わせから導出できるため、ビューで提供する。

```sql
create or replace view task_effective_status_view as
select
  t.*,
  case
    when t.status <> 'completed'
      and t.due_at is not null
      and t.due_at < now()
    then 'overdue'
    else t.status::text
  end as effective_status
from tasks t;
```

- `effective_status` はテキストで返却し、UI のタブ表示に利用する。
- 期限超過の判定を DB に集約し、アプリ側のロジック重複を防ぐ。

## 想定クエリ
- **一覧取得**: `select * from task_effective_status_view where workspace_id = :workspace order by due_at nulls last, created_at desc;`
- **状態別件数**: `select effective_status, count(*) from task_effective_status_view where workspace_id = :workspace group by effective_status;`
- **キーワード検索**: `select * from task_effective_status_view where search_vector @@ plainto_tsquery('japanese', :term);`
- **タグフィルタ**: `… where task_id in (select task_id from task_tags where tag_id = any(:tag_ids));`

## マイグレーション順序
1. `task_status_type`・`task_priority_type` を作成。
2. `workspaces` → `tasks` → `tags` → `task_tags` の順でテーブルを作成。
3. 更新トリガー（`updated_at` 自動更新）、全文検索用 `search_vector` 更新トリガーを追加。
4. ビュー `task_effective_status_view` を作成。
5. Supabase Row Level Security を有効化し、`workspace_id` に基づくポリシーを設定。
6. （オプション）DB 側で UUID v7 を生成したい場合のみ `create extension if not exists pg_uuidv7;` を実行し、`uuid_generate_v7()` を既定値に設定。

## 拡張ポイント
- **プロパティ設定**: `task_custom_properties` テーブルで Notion 風の可変プロパティを格納する余地を残している。
- **アクティビティ監査**: ステータスや期日変更を `task_activity_log` に記録し、時間経過の分析に活用可能。
- **割り当て**: 必要に応じて `task_assignments (task_id, assignee_id, role)` を追加し、ユーザーへの担当割り当てを表現する。
