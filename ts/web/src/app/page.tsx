import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";

const valueProps = [
  {
    tag: "LLMサマリー",
    title: "日報づくりは自動で完結",
    description:
      "Drive・Obsidian・TODOの更新差分を集め、LLMが「今日の成果」を要約。手入力に頼らず、読みやすいテキストで振り返れます。",
  },
  {
    tag: "俯瞰カレンダー",
    title: "予定・TODO・要約を一画面で把握",
    description:
      "独自カレンダー上で予定とタスク、AI要約が並ぶから、空き時間と成果が同時に見える。翌日の準備も自然と整います。",
  },
  {
    tag: "柔軟なTODO",
    title: "Notion風プロパティで自分流に管理",
    description:
      "必須／任意やタグを自由に設計。AI提案タスクも好みのワークフローに合わせて取捨選択できます。",
  },
  {
    tag: "個人特化",
    title: "ソロワークを邪魔しない静かな伴走",
    description:
      "通知や共有は最小限。開きたいときに最新のログがそろう設計で、集中を途切れさせません。",
  },
];

const workflows = [
  {
    phase: "朝",
    title: "予定とTODOを整える",
    description:
      "今日の予定と重要タスクをカレンダーで一目確認。必要があれば、その場で優先度と所要時間を調整します。",
    checklist: [
      "Google Calendar と双方向で予定を同期",
      "タスクの必須／任意を切り替えて当日の集中領域を決める",
      "AI提案のTODOを採用して空白を埋める",
    ],
  },
  {
    phase: "日中",
    title: "作業ログを自動でためる",
    description:
      "Drive や Obsidian の更新、TODO の進捗は静かに記録。振り返りのためのスクラップ作成に時間を奪われません。",
    checklist: [
      "対象フォルダ／バケット配下の更新差分をウォッチ",
      "タスク進捗は属性付きで変更履歴を保持",
      "除外ワードとマスキング設定でプライバシーを担保",
    ],
  },
  {
    phase: "夕方",
    title: "成果と学びをプレイバック",
    description:
      "自動生成された日次要約を読み、未完タスクと直近予定を確認。翌日のTODOを軽く整えて、達成感のある終業へ。",
    checklist: [
      "「やったこと／成果物／学び／未完・次やること」をLLMが整理",
      "夕方帯の滞在時間を伸ばす静かなUI",
      "任意期間のまとめ要約で週次・月次もすぐ振り返り",
    ],
  },
];

const principles = [
  {
    title: "記録は自動、意思決定は人",
    description:
      "ログ収集と要約は自動化しつつ、採用・編集の最終判断はユーザーに委ねる。AIは“提案役”に徹します。",
  },
  {
    title: "テキストが主役のダッシュボード",
    description:
      "グラフよりも読みやすい言葉を優先。要約が中心に据わったカレンダー体験で、理解コストを最小化します。",
  },
  {
    title: "続けやすさをデザインする",
    description:
      "通知や共有を排し、開いた瞬間に最新データが整っている状態をキープ。フリーランスや学習者が毎日使いたくなる軽さを目指しています。",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-amber-50 text-foreground dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-[-20%] h-[420px] bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.35),_transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[-30%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,_rgba(253,186,116,0.28),_transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(217,119,6,0.25),_transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <nav className="sticky top-0 z-20 border-b border-border/60 bg-white/70 backdrop-blur-md dark:bg-background/70">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-lg font-semibold tracking-tight">Hibi</span>
              <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
                Personal Progress OS
              </span>
            </Link>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>

        <div className="flex flex-1 flex-col items-center gap-24 pb-24 pt-16">
          <section className="w-full px-6">
            <div className="mx-auto grid max-w-6xl gap-12 rounded-3xl border border-border/50 bg-white/70 p-10 shadow-lg backdrop-blur-md dark:border-border/40 dark:bg-white/5 lg:grid-cols-[1.1fr,_0.9fr]">
              <div className="flex flex-col gap-6">
                <span className="w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80 dark:border-primary/30 dark:text-primary-foreground">
                  日々を整える個人ハブ
                </span>
                <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                  日次要約と独自カレンダーで、今日の成長を一目で。
                </h1>
                <p className="text-lg text-muted-foreground">
                  Hibiは Drive・Obsidian・TODO を自動で集め、AI が成果をまとめるソロワーク特化のリフレクションスペース。予定、タスク、学びの記録が静かにそろい、振り返りのハードルを限りなくゼロに近づけます。
                </p>
                <div className="flex flex-col items-start gap-3 sm:flex-row">
                  <Link
                    href={hasEnvVars ? "/summary" : "#setup"}
                    className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-md transition hover:opacity-90"
                  >
                    {hasEnvVars ? "サマリーを体験する" : "セットアップから始める"}
                  </Link>
                  <a
                    href="#vision"
                    className="inline-flex items-center justify-center rounded-full border border-border/70 px-6 py-3 text-sm font-medium text-foreground transition hover:border-foreground/80 hover:text-foreground"
                  >
                    コンセプトを詳しく見る
                  </a>
                </div>
                <dl className="grid gap-6 text-sm sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      連携
                    </dt>
                    <dd className="mt-2 text-lg font-semibold">
                      Drive / Obsidian / Calendar
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      自動化
                    </dt>
                    <dd className="mt-2 text-lg font-semibold">
                      日次要約 + TODO提案
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      フォーカス
                    </dt>
                    <dd className="mt-2 text-lg font-semibold">
                      個人利用に最適化
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col justify-center gap-6 rounded-3xl border border-border/50 bg-gradient-to-br from-sky-100/60 via-white to-amber-100/50 p-8 shadow-inner dark:border-border/30 dark:from-sky-900/20 dark:via-slate-950 dark:to-amber-900/10">
                <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                  <p className="text-base font-semibold text-foreground">
                    「夕方に何を成し遂げたか」を一呼吸で思い出すためのホーム。
                  </p>
                  <p>
                    カレンダーとTODOは常に同期し、LLMが成果を言語化。任意期間のまとめ要約で、週次・月次の振り返りも滑らかに。
                  </p>
                  <p>
                    プライバシー設定や除外キーワードで、見せたくない情報は最初からフィルタリング。ソロワークの継続率を高めることだけに集中しています。
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-white/80 p-6 text-sm shadow-sm dark:bg-white/5">
                  <p className="font-semibold text-foreground">
                    成功指標（暫定）
                  </p>
                  <ul className="mt-3 space-y-2 text-muted-foreground">
                    <li>・週次／30日アクティブ率の向上</li>
                    <li>・日次要約の閲覧率と滞在時間</li>
                    <li>・手動日報作成時間の削減</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="vision" className="w-full px-6">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-4 text-center sm:text-left">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Value Proposition
                </span>
                <h2 className="text-3xl font-semibold">Hibiが提供する価値</h2>
                <p className="text-base text-muted-foreground">
                  ビジョンで掲げた「日々の仕事・学習の進捗と成長を、ひとつの場所で楽しく・カンタンに振り返れる世界」を実現するためのコアバリューです。
                </p>
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {valueProps.map((item) => (
                  <article
                    key={item.title}
                    className="group relative overflow-hidden rounded-3xl border border-border/50 bg-white/70 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-border/30 dark:bg-white/5"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      {item.tag}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sky-400/40 via-sky-500/40 to-amber-400/40 opacity-0 transition group-hover:opacity-100 dark:from-sky-500/30 dark:via-sky-400/20 dark:to-amber-500/20" />
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="w-full px-6">
            <div className="mx-auto max-w-6xl rounded-3xl border border-border/50 bg-white/70 p-10 shadow-lg backdrop-blur-md dark:border-border/40 dark:bg-white/5">
              <div className="grid gap-12 lg:grid-cols-[0.9fr,_1.1fr]">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Daily Flow
                  </span>
                  <h2 className="mt-3 text-3xl font-semibold">1日のリズムに寄り添う体験</h2>
                  <p className="mt-3 text-base text-muted-foreground">
                    朝・日中・夕方、それぞれの目的に合わせたインタフェースと自動化で、ログを残すことよりも成果づくりに時間を使えます。
                  </p>
                </div>
                <div className="space-y-8">
                  {workflows.map((item) => (
                    <article
                      key={item.phase}
                      className="relative rounded-2xl border border-border/60 bg-white/80 p-6 shadow-sm dark:border-border/40 dark:bg-white/5"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        {item.phase}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {item.checklist.map((point) => (
                          <li key={point} className="pl-3">
                            ・{point}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="w-full px-6">
            <div className="mx-auto max-w-6xl grid gap-10 rounded-3xl border border-border/50 bg-white/70 p-10 shadow-lg backdrop-blur-md dark:border-border/40 dark:bg-white/5 lg:grid-cols-[1.1fr,_0.9fr]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Product Tenets
                </span>
                <h2 className="mt-3 text-3xl font-semibold">設計原則と差別化ポイント</h2>
                <p className="mt-3 text-base text-muted-foreground">
                  Hibiは、個人がログの統合や振り返りに費やす時間を減らし、成長の実感を高めるためのプロダクトとして設計されています。
                </p>
              </div>
              <div className="space-y-4">
                {principles.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-sm dark:border-border/30 dark:bg-white/5"
                  >
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground dark:border-border/40 dark:bg-background/50">
                  他の「可視化ツール」がグラフやチーム前提で設計されているなか、Hibiは要約重視・ソロ特化の静かな伴走体験で差別化します。
                </div>
              </div>
            </div>
          </section>

          <section id="setup" className="w-full px-6">
            <div className="mx-auto max-w-4xl rounded-3xl border border-border/50 bg-white/80 p-10 shadow-lg backdrop-blur-md dark:border-border/40 dark:bg-white/5">
              <div className="flex flex-col gap-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Next Steps
                </span>
                <h2 className="text-3xl font-semibold">
                  {hasEnvVars
                    ? "テストユーザーを作成して体験をはじめる"
                    : "まずは環境変数を設定して Supabase と接続"}
                </h2>
                <p className="text-base text-muted-foreground">
                  ローカル環境でビジョンに沿った体験を確認するための手順です。完了後はサマリー画面から日次要約のワークフローを試せます。
                </p>
              </div>
              <div className="mt-8">
                {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
              </div>
            </div>
          </section>
        </div>

        <footer className="border-t border-border/60 bg-white/70 py-10 text-xs text-muted-foreground backdrop-blur-md dark:bg-background/70">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <p>
              Powered by{" "}
              <a
                href="https://kohsuk.tech"
                target="_blank"
                className="font-semibold text-foreground hover:underline"
                rel="noreferrer"
              >
                KOHSUK
              </a>
            </p>
            <ThemeSwitcher />
          </div>
        </footer>
      </div>
    </main>
  );
}
