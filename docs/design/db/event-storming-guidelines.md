# イベントストーミング対応データベース設計指針

## 背景と目的
- エンドユーザーとのイベントストーミングで得られたドメインイベントを、永続化層で失わずに管理するための設計基準を定める。
- 各境界づけられたコンテキストが独立したイベントストア（イベント履歴＋スナップショット）を持ち、状態復元・監査・非同期連携を容易にする。
- Postgres を前提とし、既存の [database-schema-guidelines.md](database-schema-guidelines.md) で定義したスキーマ分離ルールを拡張する。

## 共通設計ポリシー
- スキーマはコンテキストごとに専有し、イベント管理もスキーマ単位で完結させる。別コンテキストが直接参照する場合はビューまたは API を介す。
- イベントストリームは「ストリーム ID（集約） × ストリーム名（コンテキスト固有の論理名）」で一意に識別し、順序はバージョン番号で保証する。
- イベントデータは `jsonb` で保持し、型変化はアプリケーション層でバージョニング管理する。
- スナップショットは任意タイミングで集約状態の復元点を持たせ、リプレイ時間を短縮する。スナップショット生成はバックエンドサービスが責任を持つ。

## スキーマ構成と命名
- スキーマ名はコンテキスト名に揃える（例 `baskets`、`orders`）。イベント系のテーブルは各スキーマ内で同名を採用し、運用手順を共通化する。
- 最低限、`events`・`snapshots` テーブルと `updated_at_trigger()` を利用するトリガーを準備する。トリガー関数は `database-schema-guidelines.md` に沿って `shared` など共通スキーマで管理しても良い。
- 将来的にアウトボックスやプロジェクション用の補助テーブルを追加する場合も、スキーマ内に収めてコンテキストの独立性を維持する。

## イベントストリームテーブル

### `events` テーブル定義
```sql
CREATE TABLE baskets.events
(
    workspace_id   uuid        NOT NULL,
    stream_id      text        NOT NULL,
    stream_name    text        NOT NULL,
    stream_version int         NOT NULL,
    event_id       text        NOT NULL,
    event_name     text        NOT NULL,
    event_data     jsonb       NOT NULL,
    occurred_at    timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, stream_id, stream_name, stream_version)
);
```

- `workspace_id`: ユーザーが所属するワークスペース ID。`workspaces.id` への外部キーとし、リクエストコンテキストと一致する値をアプリケーション層で設定する。
- `stream_id`: 集約単位の識別子。アプリケーション層で UUIDv7 などの一意キーを生成する。
- `stream_name`: コンテキスト内での論理名（例: `basket`、`order`）。複数種ストリームを同一スキーマで扱う場合に区別する。
- `stream_version`: 1 から始まる連番。楽観ロック用途で使用し、挿入時に直前バージョンを検証する。
- `event_id`: イベント自体の一意キー。イベント再送時の冪等性制御に利用する。
- `event_name`: ドメインイベント名。バージョニング時は `BasketCheckedOut.v2` のように命名する。
- `event_data`: イベント payload を保持する `jsonb`。スキーマレスの柔軟性を活かしつつ、整合性チェックはアプリケーション層で実施する。
- `occurred_at`: ドメインイベントの発生時刻。アプリから明示的に渡す場合はアプリ値を優先し、未指定なら既定値を利用する。
- 主キー `(workspace_id, stream_id, stream_name, stream_version)` がワークスペース単位の順序と一意制約を担保する。補助的に `(event_id)` のユニーク制約を設定しても良い。
- 取得頻度が高いストリームについては `(workspace_id, stream_name, stream_id, occurred_at)` の複合インデックスを追加し、マルチテナント環境での時系列リプレイを高速化する。

### 追加メタデータの拡張例
- ソースサービスやトレース情報を追跡する場合は `metadata jsonb` 列を追加し、非機能要件を満たす。
- イベント受信側で冪等性を確認するために `correlation_id` や `causation_id` などの列を追加する運用も検討する。

## スナップショットテーブル
```sql
CREATE TABLE baskets.snapshots
(
    workspace_id     uuid        NOT NULL,
    stream_id        text        NOT NULL,
    stream_name      text        NOT NULL,
    stream_version   int         NOT NULL,
    snapshot_name    text        NOT NULL,
    snapshot_data    jsonb       NOT NULL,
    updated_at       timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, stream_id, stream_name)
);
```

- `workspace_id`: ワークスペース単位での所有権を示す。`events.workspace_id` と同じ値を保持し、`workspaces.id` への外部キーに揃える。
- `stream_version`: スナップショット時点のバージョン。リプレイ開始位置の基準となる。
- `snapshot_name`: スナップショット種別（例: `basket-summary`）。複数学習済み投影を扱う場合に区別する。
- `snapshot_data`: 集約状態を保持する `jsonb`。構造の把握や差分検証が容易になり、圧縮が必要な場合はアプリケーション層で対応する。
- 最新スナップショットのみ保持する方針のため、主キーは `(workspace_id, stream_id, stream_name)` とする。履歴管理が必要な場合は `stream_version` を含めた複合主キーへ拡張する。
- `updated_at` は更新のたびに自動更新し、監査ログやキャッシュ無効化のトリガーに利用する。

## Row Level Security の設定
- Supabase ではユーザーの所属ワークスペースを `auth.users.raw_app_meta_data.workspace` に保持し、JWT 内に `app_metadata.workspace` が含まれるようにする。ユーザーが更新可能な `raw_user_meta_data` には保存しない。
- `events`・`snapshots` ともに `workspace_id` 列を追加したため、全操作で JWT のワークスペースと一致するかを検証する。
- RLS 設定例:
  ```sql
  alter table baskets.events enable row level security;
  alter table baskets.snapshots enable row level security;

  -- 参照時は JWT 内の workspace と列が一致する場合のみ許可
  create policy "workspace matches jwt (select)" on baskets.events
  for select to authenticated
  using (
    workspace_id = (auth.jwt() -> 'app_metadata' ->> 'workspace')::uuid
  );

  create policy "workspace matches jwt (modify)" on baskets.events
  for all to authenticated
  using (
    workspace_id = (auth.jwt() -> 'app_metadata' ->> 'workspace')::uuid
  )
  with check (
    workspace_id = (auth.jwt() -> 'app_metadata' ->> 'workspace')::uuid
  );

  create policy "workspace matches jwt (select)" on baskets.snapshots
  for select to authenticated
  using (
    workspace_id = (auth.jwt() -> 'app_metadata' ->> 'workspace')::uuid
  );

  create policy "workspace matches jwt (modify)" on baskets.snapshots
  for all to authenticated
  using (
    workspace_id = (auth.jwt() -> 'app_metadata' ->> 'workspace')::uuid
  )
  with check (
    workspace_id = (auth.jwt() -> 'app_metadata' ->> 'workspace')::uuid
  );
  ```
- `auth.jwt()` に頼るポリシーは JWT のリフレッシュが完了するまで反映されない点に注意し、管理画面等で強制リフレッシュ手段を用意する。
- アプリケーション側では必ず `workspace_id` を明示して insert/update し、誤ったワークスペースへの書き込みを防ぐ。サーバーサイドでは `auth.uid()` とアプリケーション DB のユーザーレコードを突合させ、JWT の `workspace` と `users.workspace_id` が一致するかを検証する。

## トリガーと補助関数
```sql
CREATE TRIGGER updated_at_snapshots_trgr
BEFORE UPDATE ON baskets.snapshots
FOR EACH ROW
EXECUTE PROCEDURE updated_at_trigger();
```

- `updated_at_trigger()` は共通関数として一度定義し、複数スキーマから再利用する。存在しない場合は `shared.updated_at_trigger` などとして `search_path` に追加する。
- イベントテーブルには原則トリガーを設定しない。アプリケーションが順序と冪等性を担保し、トリガーは `snapshots` など再計算不要なテーブルのメタ更新に限定する。

## ストリーム管理と運用
- イベント投入はアプリケーション層でトランザクション制御し、`stream_version` を使った楽観ロックを必須にする（例: `WHERE stream_version = :expected_version`）。
- リプレイは「最新スナップショット → 対象バージョンまでのイベント」を順序で取得する。SQL 例:
  ```sql
  SELECT *
  FROM baskets.events
  WHERE stream_name = 'basket'
    AND stream_id = :stream_id
    AND stream_version > :snapshot_version
  ORDER BY stream_version;
  ```
- CQRS プロジェクションや外部連携は `occurred_at` の昇順で購読し、`event_id` を記憶して冪等性を担保する。
- ストリーム削除は原則禁止とし、論理削除やレガシー化はイベントで表現する。どうしても削除が必要な場合は監査ログと合わせてオペレーションガイドを整備する。

## マイグレーションとバージョニング
- コンテキストごとに `db/migrations/<context>/` 配下へ DDL を配置し、イベント系テーブルの追加・変更はアプリケーションのイベントバージョンと同期させる。
- 既存イベントの構造変更が必要な場合は、新イベント名を追加して段階的に移行する。`event_data` の後方互換性を最優先する。
- スナップショット構造を変更する際は、旧データを移行するマイグレーションを同梱し、必要に応じて全ストリームの再スナップショットを実施する。

## データライフサイクルと監査
- 長期保管が不要なイベントはアーカイブスキーマへ移送し、ストリーム単位で統合エクスポートできるバッチ処理を用意する。
- PII を含む payload は暗号化やマスキングを検討し、アプリケーション層で復号する。
- 監査目的で `event_id` に対する検索を高速化したい場合は、専用のユニークインデックスと監査ログテーブルを用意する。

## 拡張ポイント
- **アウトボックス統合**: 同一トランザクション内で `outbox` テーブルへイベントを複製し、メッセージング基盤へ非同期配信する。
- **読み取り最適化**: 頻出クエリに合わせたマテリアライズドビュー（例: 集計、最新状態）を各スキーマに追加し、レポート用途を切り出す。
- **監視**: ストリームごとのイベント蓄積数や最新バージョンを `prometheus` 等で可視化し、異常検知を自動化する。

この指針を各コンテキストのスキーマ設計のベースラインとし、イベントストーミングで抽出したドメイン知識を失わずに永続化できる状態を維持する。
