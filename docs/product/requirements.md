# Requirements Document

## Introduction

個人の「日々の仕事・学習の進捗」と「成長」を、楽しみながら一元管理するアプリケーション。  
Google Drive と S3/R2（Obsidian 同期前提）等のストレージに散在する成果・メモ・学習ログ、独自 TODO、独自カレンダー/Google Calendar を横断し、LLM により日次の進捗をテキストで要約する。  
MVP では独自カレンダー（+Google Calendar 連携）、独自 TODO、Drive と S3/R2（Obsidian 同期）の取り込み、日次要約の自動生成、AI による TODO 候補提案までを対象とする。通知は行わない。  
本アプリは**個人利用**を前提とし、チーム/共有機能は対象外（後述の将来要件を除く）。

## Requirements (MVP)

### Requirement 1 — 日次サマリーの同時閲覧（カレンダー×TODO×テキスト要約）
**User Story:** 記録好きな個人ユーザーとして、カレンダー画面で日次要約テキストと TODO の完了/未完を同時に見たい。そうすることで、その日の実績と残タスクを一目で整理したい。  
#### Acceptance Criteria
1. WHEN カレンダーの日付セルを開く THEN システムは①日次要約テキスト、②当日の完了/未完/期限超過 TODO を同一ビューで表示する SHALL  
2. WHEN カレンダー表示中 THEN イベント一覧（独自/Google）が同画面で参照可能である SHALL  
3. WHEN 日次要約が長文の場合 THEN 主要ハイライト（最大3件）を先頭に表示し、詳細は折りたたみ表示する SHALL  
4. IF 当日に要約が未生成 THEN システムは「生成」操作を提示し、生成完了後に同画面へ反映する SHALL

### Requirement 2 — 独自カレンダーと Google Calendar 連携
**User Story:** ユーザーとして、アプリ内の独自カレンダーを使いつつ Google Calendar とも予定を同期したい。一箇所で予定と進捗を管理したい。  
#### Acceptance Criteria
1. WHEN Google アカウント連携が完了する THEN システムは Google Calendar のイベント閲覧/追加/編集を実行可能にする SHALL  
2. WHEN アプリでイベントを追加/編集/削除する THEN システムは Google Calendar に双方向同期する SHALL  
3. IF 同期競合が発生 THEN システムは「最新更新優先」等の既定ルールで解決し、イベント詳細に競合解決のメモを残す SHALL  
4. WHEN 日次要約が作成される THEN システムは**要約データを Google Calendar へは書き込まない**（独自側のみで保持）SHALL  
5. WHEN タイムゾーンが異なる端末からアクセスする THEN システムはユーザー設定のタイムゾーンで一貫表示する SHALL

### Requirement 3 — 独自 TODO（Notion 風の柔軟プロパティ）
**User Story:** ユーザーとして、TODO に任意のプロパティを持たせ、必須/任意も自分で決めたい。自分のワークフローに沿って管理したい。  
#### Acceptance Criteria
1. WHEN ユーザーがプロパティを追加/編集する THEN システムは文字列/数値/日付/セレクト/マルチセレクト/チェックボックス等の型をサポートする SHALL  
2. WHEN プロパティに必須設定がある THEN システムは未入力時に保存をブロックし、欠落項目を明示する SHALL  
3. WHEN TODO の期日が過ぎる THEN システムは自動で「期限超過」ステータスを付与する SHALL  
4. WHEN 当日の TODO 状態が更新される THEN 日次要約ビューに完了/未完/期限超過が自動反映される SHALL

### Requirement 4 — ストレージ接続（Google Drive / S3・R2 + Obsidian）
**User Story:** フリーランス/学習者として、Drive と Obsidian 同期（S3/R2）を接続し、指定フォルダ/バケット配下の変更を進捗として扱いたい。  
#### Acceptance Criteria
1. WHEN Google Drive を接続する THEN ユーザーは要約対象とするルートフォルダを1つ以上選択できる SHALL  
2. WHEN S3/R2 を接続する THEN ユーザーはバケットとプレフィックス（Obsidian Vault 相当）を指定できる SHALL  
3. WHEN 接続が完了する THEN システムは指定範囲内の新規/更新ファイルを検知してインデックス化する SHALL  
4. IF ユーザーが除外パターン（フォルダ/拡張子）を設定 THEN システムは除外を適用する SHALL

### Requirement 5 — ストレージ上での通常操作（指定範囲内）
**User Story:** ユーザーとして、アプリから指定フォルダ（Drive）/プレフィックス（S3/R2）内でフォルダ作成やファイル追加など基本操作を行いたい。  
#### Acceptance Criteria
1. WHEN ユーザーが新規フォルダ作成を行う THEN システムは指定範囲内にフォルダ（または相当のプレフィックス）を作成する SHALL  
2. WHEN ユーザーがファイルをアップロードする THEN システムは指定範囲内にファイルを追加する SHALL  
3. WHEN ユーザーがファイル一覧表示を行う THEN システムは指定範囲内のみを表示する SHALL  
4. IF 権限が不足 THEN システムは不足スコープと対処方法を提示する SHALL

### Requirement 6 — 日次要約の自動生成（LLM）
**User Story:** 忙しい個人ユーザーとして、Drive/Obsidian の差分から日次要約を自動で作ってほしい。手動で日報を作らず振り返りたい。  
#### Acceptance Criteria
1. WHEN 要約生成が行われる THEN システムは当日の新規/更新ファイル（件名/見出し/差分）と TODO 状態を入力として用いる SHALL  
2. WHEN 要約を出力する THEN 構成は「やったこと」「作成/更新した成果物」「学び/気づき」「未完/次やること」を含む SHALL  
3. IF 機密語句/個人情報の自動マスキングが有効 THEN システムは検出範囲をマスクし、元データへは影響しない SHALL  
4. WHEN 要約が生成完了する THEN 日付セルの要約ビューへ即時反映する SHALL

### Requirement 7 — 任意期間のまとめ要約（週次/月次想定）
**User Story:** ユーザーとして、任意の期間を選択してまとめ要約を生成したい。定期振り返りに使いたい。  
#### Acceptance Criteria
1. WHEN ユーザーが日付範囲を選択し「要約」を実行する THEN システムは期間内の日次要約を統合しテキストレポートを生成する SHALL  
2. WHEN レポートを生成する THEN ハイライト/完了タスク数/未完タスク一覧/主要作成物の概要を含む SHALL  
3. IF 期間内に要約未生成日がある THEN システムは該当日をスキップまたはオンデマンド生成の選択肢を提示する SHALL

### Requirement 8 — AI アシスト（TODO 候補提案）
**User Story:** 学習者/開発者として、目標や大まかなタスクを入力すると AI が TODO 候補を提示してくれると嬉しい。自分に合うものを選んで登録したい。  
#### Acceptance Criteria
1. WHEN ユーザーが目標/タスク素案を入力する THEN システムは粒度/期日/所要時間/依存関係を含む TODO 候補を提示する SHALL  
2. WHEN 候補が表示される THEN ユーザーは取捨選択して独自 TODO に一括登録できる SHALL  
3. IF 必須プロパティが未設定 THEN 登録前に一括補完ダイアログを提示する SHALL  
4. WHEN 候補から登録された TODO に期日がある THEN システムはカレンダーとの関連（当日/翌日以降）を作成する SHALL

### Requirement 9 — 朝/日中/夕方の利用フロー
**User Story:** ユーザーとして、朝は計画、日中は自動記録、夕方は要約で振り返りと明日準備をしたい。  
#### Acceptance Criteria
1. WHEN 朝にカレンダーを開く THEN システムは当日のイベントと TODO（推奨並び替え）を表示する SHALL  
2. WHEN 日中に作業が行われる THEN システムは接続ストレージの変更を自動収集/インデックス化する SHALL  
3. WHEN 夕方に日付セルを開く THEN システムは当日の要約と期限迫る TODO、直近予定を併記して表示する SHALL

### Requirement 10 — 通知なし運用
**User Story:** ユーザーとして、通知に依存せず自分のタイミングで確認したい。  
#### Acceptance Criteria
1. WHEN 要約や同期が完了しても THEN システムはプッシュ通知/メール通知を送信しない SHALL  
2. WHEN ユーザーがアプリを開く THEN 最新状態が反映されたビューを表示する SHALL

### Requirement 11 — 個人利用前提（シングルユーザー）
**User Story:** 個人ユーザーとして、まずは自分専用で使いたい。共有や組織管理は不要。  
#### Acceptance Criteria
1. WHEN アカウントが作成される THEN システムは単一ユーザーのデータ空間を作成する SHALL  
2. IF 外部共有/共同編集が要求される THEN MVP では不可能である旨を明示する SHALL

### Requirement 12 — プロジェクト単位のタスク管理
**User Story:** 複数の取り組みを並行する個人ユーザーとして、TODO をプロジェクト別に整理したい。そうすることで、プロジェクトごとの進捗を可視化して抜け漏れなく進めたい。  
#### Acceptance Criteria
1. WHEN ユーザーが新規プロジェクトを作成する THEN システムは名称・目的・期間（開始/終了予定）を登録できるフォームを提供する SHALL  
2. WHEN TODO を作成/編集する THEN システムは既存プロジェクトへの紐付け（任意）を選択できる UI を表示する SHALL  
3. WHEN プロジェクト詳細ビューを開く THEN システムは完了/進行中/未着手のタスク数と進捗率を表示し、TODO 一覧をステータス別に整理して表示する SHALL  
4. WHEN TODO の状態が変化する THEN システムは該当プロジェクトの進捗指標（件数・完了率）を即時更新する SHALL

## Future Requirements (Post-MVP)

### Requirement F1 — コントリビューション可視化（GitHub & 他ソース）
**User Story:** エンジニアとして、GitHub のヒートマップのように Drive/Obsidian なども貢献度として可視化したい。コード以外の進捗も一目で実感したい。  
#### Acceptance Criteria
1. WHEN ヒートマップを表示する THEN GitHub のコミット/PR/レビューを日次スコア化して反映する SHALL  
2. WHEN Drive/Obsidian のアクティビティを集計する THEN 新規=+2、更新=+1 等のスコアリングを適用（上限/正規化を実装）SHALL  
3. WHEN 任意の日付マスをクリックする THEN 当日の要約へ遷移する SHALL

### Requirement F2 — AI フル自動計画（目標→週次/日次→TODO）
**User Story:** ユーザーとして、目標を入力するだけで週次計画と日次 TODO まで自動生成してほしい。  
#### Acceptance Criteria
1. WHEN 目標（期間/到達基準/投下時間）が入力される THEN システムは週次→日次へ分解した計画案を生成する SHALL  
2. WHEN 計画案が提示される THEN ユーザーは一括採用/一部修正/破棄を選択できる SHALL  
3. WHEN 進捗が遅延する THEN システムは次週の自動リプラン案を提示する SHALL

### Requirement F3 — AI 補助（既存 TODO の整理/優先度付け）
**User Story:** ユーザーとして、自分で登録した TODO を AI によって整理・優先度付けしてほしい。  
#### Acceptance Criteria
1. WHEN 整理を実行する THEN システムは重要度/緊急度/依存関係で並び替えとタグ提案を行う SHALL  
2. WHEN スケジューリング提案を受け入れる THEN システムはカレンダーへの割当案を作成する SHALL

### Requirement F4 — Notion 連携
**User Story:** Notion ユーザーとして、学習記録やデータベース項目を取り込みたい。  
#### Acceptance Criteria
1. WHEN Notion を接続する THEN ユーザーは対象データベース/ページを選択できる SHALL  
2. WHEN 取り込みが実行される THEN システムは新規/更新項目を日次要約の素材として扱う SHALL

### Requirement F5 — 可視化（グラフ/チャート）
**User Story:** ユーザーとして、進捗推移や達成度をグラフで見たい。  
#### Acceptance Criteria
1. WHEN 可視化を有効化する THEN システムは週次/月次の完了タスク推移などの基本チャートを提供する SHALL  
2. IF 可視化が無効 THEN MVP 同様のテキスト中心 UI を維持する SHALL

## Notes / Constraints
- MVP では通知を一切行わない。  
- 日次要約は独自カレンダー側にのみ保持し、Google Calendar へ書き込まない。  
- セキュリティ/プライバシー設定（除外パターン、マスキング）は提供するが、MVP では最小限から開始し拡張可能とする。
