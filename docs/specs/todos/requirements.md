# Requirements Document — 独自 TODO（Notion 風プロパティ）

## Introduction

本要件は、本アプリケーションの **独自 TODO** 機能（Notion のデータベースのように任意プロパティを柔軟に定義でき、必須設定も可能）に関する MVP 要件を定義する。  
TODO は独自カレンダー／日次要約と密に連動し、**完了／未完／期限超過** を明確に扱う。通知は行わない。

## Requirements (MVP)

### Requirement 1 — タスク基本モデル

**User Story:** ユーザーとして、タイトルと基本属性を持つタスクを作成・管理したい。そうすることで、最小限のコストでタスク登録を始められる。

#### Acceptance Criteria

1. WHEN 新規タスクを作成する THEN システムは **タイトル** を必須として保存する SHALL
2. WHEN タスクを保存する THEN システムは **作成日時／更新日時** と **ステータス（未着手・進行中・完了・期限超過）** を保持する SHALL
3. WHEN 期日が設定される THEN システムはユーザー設定の **タイムゾーン** で解釈・表示する SHALL
4. IF タイトルが未入力 THEN システムは保存をブロックし、エラー理由を明示する SHALL

### Requirement 2 — 柔軟プロパティ（Notion 風）

**User Story:** ユーザーとして、任意のプロパティを自由に追加し、必須項目も自分で定義したい。ワークフローに合わせて TODO をカスタマイズしたい。

#### Acceptance Criteria

1. WHEN プロパティを追加/編集する THEN システムは **型**（テキスト／数値／日付／セレクト／マルチセレクト／チェックボックス）をサポートする SHALL
2. WHEN プロパティに **必須** が設定される THEN システムは未入力時に保存をブロックし、欠落項目を明示する SHALL
3. WHEN 既存タスクに新プロパティが追加される THEN システムは **デフォルト値** または **未設定** として一貫処理する SHALL
4. WHEN プロパティを削除する THEN システムは関連データを安全に削除し、影響範囲を事前表示する SHALL

### Requirement 3 — CRUD & 一覧/詳細ビュー

**User Story:** ユーザーとして、タスクの作成/編集/削除と、一覧・詳細の閲覧をスムーズに行いたい。

#### Acceptance Criteria

1. WHEN 一覧ビューを開く THEN システムは **フィルタ／ソート**（例：期日、ステータス、セレクト値）を提供する SHALL
2. WHEN タスクを編集する THEN システムは **インライン編集** を可能とし、保存時にバリデーションを行う SHALL
3. WHEN タスクを削除する THEN システムは **ソフトデリート（ゴミ箱）** とし、一定期間の復元を可能にする SHALL
4. WHEN 詳細ビューを開く THEN システムは全プロパティを表示し、編集可能にする SHALL

### Requirement 4 — ステータスと期限超過の自動判定

**User Story:** ユーザーとして、期日を過ぎたタスクは自動で「期限超過」と識別したい。優先対応が分かるようにしたい。

#### Acceptance Criteria

1. WHEN 期日の到来を検知する THEN システムは未完了タスクを **期限超過** に自動更新する SHALL
2. WHEN タスクが完了に変更される THEN システムは **完了日時** を記録する SHALL
3. WHEN 一覧ビューを表示する THEN システムは **期限超過** を視覚上で強調表示する SHALL
4. IF 期日が未設定 THEN システムは期限超過判定を行わない SHALL

### Requirement 5 — カレンダー連動（独自カレンダー）

**User Story:** ユーザーとして、タスクの期日をカレンダー上でも確認したい。日付ごとにやるべきことを俯瞰したい。

#### Acceptance Criteria

1. WHEN 期日が設定されたタスクが存在する THEN システムは該当日セルに **タスク件数とステータス別概要** を表示する SHALL
2. WHEN カレンダー日セルを開く THEN システムは当日の **完了／未完／期限超過** タスク一覧を表示する SHALL
3. WHEN カレンダーからタスクを新規作成する THEN システムは選択日を **期日初期値** として編集画面を開く SHALL
4. IF Google Calendar と併用中 THEN タスクは **独自カレンダー内** にのみ表示し、Google 側イベントには書き込まない SHALL

### Requirement 6 — 日次要約への反映

**User Story:** ユーザーとして、日次要約に当日のタスク進捗が自動で反映されてほしい。

#### Acceptance Criteria

1. WHEN 日次要約を生成する THEN システムは当日の **完了／未完／期限超過** タスクを集計し、要約セクションに出力する SHALL
2. WHEN タスク状態が更新される THEN システムは日次要約ビューに **リアルタイム反映** する SHALL
3. IF 当日タスクが存在しない THEN 要約のタスクセクションは「該当なし」を表示する SHALL

### Requirement 7 — 任意期間のまとめ要約（タスク観点）

**User Story:** ユーザーとして、週次や月次など任意期間のタスク実績をまとめて振り返りたい。

#### Acceptance Criteria

1. WHEN 期間要約を生成する THEN システムは **完了数／未完数／期限超過数** を集計し、主要ハイライトとともに出力する SHALL
2. WHEN 期間内の未完タスクを表示する THEN システムは **未消化リスト** を出力する SHALL
3. IF 期間中に要約未生成日がある THEN システムはスキップまたはオンデマンド生成の選択肢を提示する SHALL

### Requirement 8 — AI 連携（TODO 候補提案の採用）

**User Story:** ユーザーとして、AI が提案した TODO 候補を取捨選択して一括登録したい。

#### Acceptance Criteria

1. WHEN AI 候補を表示する THEN システムは **粒度／期日／所要時間／依存関係** を含むカードとして提示する SHALL
2. WHEN 候補を採用する THEN システムは選択した項目を **独自 TODO** に一括登録する SHALL
3. IF 必須プロパティが未入力 THEN 登録前に **一括補完ダイアログ** を提示する SHALL
4. WHEN 期日を持つ候補を採用する THEN システムは該当日を独自カレンダーに表示する SHALL

### Requirement 9 — 検索・フィルタ・保存ビュー

**User Story:** ユーザーとして、複数条件でタスクを素早く探し、よく使う絞り込みを保存して再利用したい。

#### Acceptance Criteria

1. WHEN 検索を実行する THEN システムは **タイトル／テキスト型プロパティ** を対象に全文検索する SHALL
2. WHEN 複数条件フィルタを設定する THEN システムは **AND/OR** 条件をサポートする SHALL
3. WHEN ビューを保存する THEN システムは条件・ソート順を **保存ビュー** として再利用可能にする SHALL

### Requirement 10 — データ整合性・履歴

**User Story:** ユーザーとして、誤操作に備えて履歴を辿ったり復元したい。

#### Acceptance Criteria

1. WHEN タスクが更新される THEN システムは **変更履歴（誰が・いつ・何を）** を保持する SHALL（単一ユーザー想定のため「誰が」は自身）
2. WHEN ゴミ箱から復元する THEN システムは最新状態でタスクを元に戻す SHALL
3. IF 履歴が一定期間を超過 THEN システムはストレージ方針に従って **古い履歴をローテーション** する SHALL

### Requirement 11 — 非通知ポリシー

**User Story:** ユーザーとして、通知に依存せず自分のタイミングで確認したい。

#### Acceptance Criteria

1. WHEN タスク状態が変化しても THEN システムは **プッシュ通知／メール通知** を送信しない SHALL
2. WHEN 画面を表示する THEN システムは **最新状態** を即時反映する SHALL

## Future Requirements (Post-MVP)

### Requirement F1 — バルク編集 & インポート/エクスポート

**User Story:** ユーザーとして、一括で編集したり CSV/JSON で入出力したい。

#### Acceptance Criteria

1. WHEN 複数選択を行う THEN システムは **一括ステータス変更／期日一括変更** を提供する SHALL
2. WHEN エクスポートを実行する THEN システムは **CSV/JSON** 形式を提供する SHALL

### Requirement F2 — 繰り返しタスク

**User Story:** ユーザーとして、定期的に発生するタスクを繰り返し設定で自動生成したい。

#### Acceptance Criteria

1. WHEN 繰り返し設定を保存する THEN システムは指定ルールに基づき **次回インスタンス** を自動生成する SHALL

## Notes / Constraints

- 単一ユーザー（個人利用）前提。共有・共同編集は対象外（MVP）。
- 通知機能は提供しない。
- Google Calendar にはタスク内容を書き込まず、独自カレンダーにのみ表示する。
- タイムゾーンはアカウント設定に基づき一貫表示する。
