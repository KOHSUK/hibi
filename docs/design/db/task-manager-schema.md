# Task Manager データベース設計

## 概要
- `ts/web/src/components/task-manager.tsx` を中心に最小のタスク管理機能を提供する。
- いわゆる Notion 風の軽量タスク管理を想定し、当面はワークスペース内のタスク・タグ管理に絞る。
- データストアは Supabase (Postgres)。ID はアプリケーション側(Go)で UUID v7 を生成するのを基本とし、将来的に必要なら DB 側の `pg_uuidv7` 拡張の導入も検討する。

## スキーマ概要
- Enum 定義: `task_status_type`(not_started/in_progress/completed), `task_priority_type`(low/medium/high)
- テーブル構成:
  - `workspaces`: ワークスペース(名前、作成/更新時刻)
  - `tasks`: タスク本体(タイトル/説明/状態/優先度/期限/完了時刻 ほか)
  - `tags`: タグ(ラベル/カラー)
  - `task_tags`: タスクとタグの多対多
- 有効ステータスの取り扱い: ビューは使用せず、UI 表示用の「エフェクティブステータス」はバックエンドで算出して返す。
- インデックス/検索: 必要な参照に合わせて GIN/BTREE を付与。UI での並び替え・検索を満たす。
- ID 方針: ID は原則アプリ側(Go)で発行する UUID v7。DB 関数は任意。

## Enum 定義

```sql
create type task_status_type as enum ('not_started', 'in_progress', 'completed');

create type task_priority_type as enum ('low', 'medium', 'high');
```

## テーブル定義

### workspaces

| 列名 | 型 | Not Null | 既定値 | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | はい |  | アプリ側発行ID(Go で UUID v7 生成) |
| name | text | はい |  | 表示名 |
| created_at | timestamptz | はい | now() | 作成時刻 |
| updated_at | timestamptz | はい | now() | 更新時刻(更新トリガ対象) |

### tasks

| 列名 | 型 | Not Null | 既定値 | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | はい |  | アプリ側発行ID(Go で UUID v7 生成) |
| workspace_id | uuid | はい |  | `workspaces.id` への外部キー |
| title | text | はい |  | タイトル(UI 必須) |
| description | text |  |  | 説明(UI 任意) |
| status | task_status_type | はい | 'not_started'::task_status_type | 基本ステータス |
| priority | task_priority_type |  |  | 任意(未設定は `NULL`) |
| due_at | timestamptz |  |  | 期限(UI 任意。期限経過時はバックエンドで過期扱い) |
| completed_at | timestamptz |  |  | 完了時刻(完了時に付与) |
| created_by | uuid |  |  | 作成者(Supabase Auth の `auth.users` を想定) |
| updated_by | uuid |  |  | 更新者 |
| created_at | timestamptz | はい | now() | 作成時刻 |
| updated_at | timestamptz | はい | now() | 更新時刻(更新トリガ対象) |
| search_vector | tsvector | はい | to_tsvector('japanese', coalesce(title, '') || ' ' || coalesce(description, '')) | タイトル/本文検索用 |

**制約/索引**
- `foreign key (workspace_id) references workspaces(id) on delete cascade`
- `check (status <> 'completed' or completed_at is not null)` で整合性確保
- `index tasks_workspace_status_idx on tasks(workspace_id, status)`
- `index tasks_workspace_due_idx on tasks(workspace_id, due_at desc nulls last)`
- `index tasks_search_idx on tasks using gin (search_vector)`

### tags

| 列名 | 型 | Not Null | 既定値 | 説明 |
| --- | --- | --- | --- | --- |
| id | uuid | はい |  | アプリ側発行ID(Go で UUID v7 生成) |
| workspace_id | uuid | はい |  | `workspaces.id` への外部キー |
| label | text | はい |  | 表示ラベル(UI 必須想定) |
| color | text |  |  | UI 用色名(Tailwind などと連携) |
| created_at | timestamptz | はい | now() | 作成時刻 |
| updated_at | timestamptz | はい | now() | 更新時刻 |

一意制約: `unique (workspace_id, label)` で重複ラベルを防止

### task_tags

| 列名 | 型 | Not Null | 既定値 | 説明 |
| --- | --- | --- | --- | --- |
| task_id | uuid | はい |  | `tasks.id` への外部キー |
| tag_id | uuid | はい |  | `tags.id` への外部キー |
| added_at | timestamptz | はい | now() | 付与時刻 |

主キー: `primary key (task_id, tag_id)`

## エフェクティブステータス(バックエンド算出)

UI 表示では以下のルールで、有効(エフェクティブ)ステータスをバックエンドで算出して返す。

- 基本: `status` をそのまま有効ステータスとする
- 例外: `status <> 'completed'` かつ `due_at` が過去なら `overdue` として扱う

レスポンス例(フィールド追加):

```json
{
  "id": "...",
  "title": "...",
  "status": "in_progress",
  "dueAt": "2025-01-01T00:00:00Z",
  "effectiveStatus": "overdue"
}
```

参考(Go 擬似コード):

```go
func effectiveStatus(t Task) string {
    if t.Status != Completed && t.DueAt != nil && t.DueAt.Before(time.Now()) {
        return "overdue"
    }
    return string(t.Status)
}
```

この方式により、DB のビューや追加オブジェクトを変更せずに仕様変更へ追随できる。

## クエリ例(ビュー不使用)
- 一覧取得: `select * from tasks where workspace_id = :workspace order by due_at nulls last, created_at desc;` を基本に、バックエンドで `effectiveStatus` を付与。
- 件数集計(小〜中規模): 一覧取得後にバックエンドでメモリ集計。
- 件数集計(中〜大規模): バックエンドから条件別に `count(*)` を発行し合算。
  - 例: `overdue`: `where workspace_id = :ws and status <> 'completed' and due_at is not null and due_at < now()`
  - 例: `completed`: `where workspace_id = :ws and status = 'completed'`
  - 例: `not_started`/`in_progress`: `where workspace_id = :ws and status in (...) and (due_at is null or due_at >= now())`
- 検索: `select * from tasks where workspace_id = :ws and search_vector @@ plainto_tsquery('japanese', :term);`
- タグ絞り込み: `... where task_id in (select task_id from task_tags where tag_id = any(:tag_ids));`

## マイグレーション手順
1. `task_status_type` と `task_priority_type` を作成
2. `workspaces`・`tasks`・`tags`・`task_tags` を作成
3. 変更トリガ(例: `updated_at`)や `search_vector` 更新を用意
4. Supabase Row Level Security を設定し、`workspace_id` によるアクセス制御を適用
5. (任意) DB で UUID v7 を使う場合は `pg_uuidv7` を導入し `uuid_generate_v7()` を使用

## 今後の拡張
- カスタムプロパティ: `task_custom_properties` などで Notion 的な柔軟属性を段階的に導入
- アクティビティログ: 変更履歴用に `task_activity_log` を検討
- アサイン: 多人数運用向けに `task_assignments (task_id, assignee_id, role)` を検討
