"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, FileText, CheckSquare, Clock } from "lucide-react"

export function DailySummary() {
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/tasks">
              <Button
                variant="ghost"
                size="icon-sm"
                className="bg-white text-foreground shadow-sm hover:bg-white/90"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-sans text-2xl font-semibold tracking-tight text-balance">
              今日の進捗
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{today}</p>
      </header>

      {/* AI Summary Section */}
      <section className="mb-6">
        <Card className="border-border/50 p-5 shadow-sm">
          <div className="mb-3 flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1 font-sans text-base font-medium">デイリーサマリー</h2>
              <p className="text-sm text-muted-foreground">AIによる自動生成</p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="leading-relaxed text-foreground">
              本日は3つのプロジェクトに取り組みました。午前中はクライアントプロジェクトのUI設計を完了し、Figmaで5つの画面デザインを作成しました。午後はコードレビューを2件実施し、新機能の実装を進めました。また、技術ドキュメントを3ページ更新し、チームとの定例ミーティングで進捗を共有しました。
            </p>
          </div>
        </Card>
      </section>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="border-border/50 p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-chart-1/10 p-2">
              <Clock className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <p className="font-mono text-xl font-semibold">6.5h</p>
              <p className="text-sm text-muted-foreground">作業時間</p>
            </div>
          </div>
        </Card>

        <Card className="border-border/50 p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-chart-2/10 p-2">
              <CheckSquare className="h-4 w-4 text-chart-2" />
            </div>
            <div>
              <p className="font-mono text-xl font-semibold">8/12</p>
              <p className="text-sm text-muted-foreground">完了タスク</p>
            </div>
          </div>
        </Card>

        <Card className="border-border/50 p-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-chart-3/10 p-2">
              <FileText className="h-4 w-4 text-chart-3" />
            </div>
            <div>
              <p className="font-mono text-xl font-semibold">15</p>
              <p className="text-sm text-muted-foreground">編集ファイル</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activities Section */}
      <section className="mb-6">
        <h2 className="mb-3 font-sans text-base font-medium">アクティビティ</h2>
        <Card className="divide-y divide-border/50 border-border/50 shadow-sm">
          <ActivityItem time="14:30" title="プロジェクト会議" description="チームとの週次進捗確認" type="calendar" />
          <ActivityItem time="11:45" title="コードレビュー完了" description="PR #234 をマージ" type="github" />
          <ActivityItem time="09:15" title="デザイン更新" description="ダッシュボードUIの改善案を作成" type="file" />
          <ActivityItem time="08:30" title="タスク完了" description="認証フローの実装" type="todo" />
        </Card>
      </section>

      {/* Files Section */}
      <section>
        <h2 className="mb-3 font-sans text-base font-medium">編集したファイル</h2>
        <Card className="border-border/50 p-4 shadow-sm">
          <div className="space-y-2.5">
            <FileItem name="dashboard-redesign.fig" type="Figma" time="2時間前" />
            <FileItem name="auth-flow.tsx" type="TypeScript" time="4時間前" />
            <FileItem name="api-documentation.md" type="Markdown" time="5時間前" />
            <FileItem name="user-research.pdf" type="PDF" time="6時間前" />
          </div>
        </Card>
      </section>
    </div>
  )
}

function ActivityItem({
  time,
  title,
  description,
  type,
}: {
  time: string
  title: string
  description: string
  type: "calendar" | "github" | "file" | "todo"
}) {
  const iconMap = {
    calendar: Calendar,
    github: FileText,
    file: FileText,
    todo: CheckSquare,
  }

  const Icon = iconMap[type]

  return (
    <div className="flex items-start gap-3 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-baseline gap-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <span className="font-mono text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
      </div>
    </div>
  )
}

function FileItem({ name, type, time }: { name: string; type: string; time: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{type}</p>
        </div>
      </div>
      <span className="ml-4 font-mono text-xs text-muted-foreground">{time}</span>
    </div>
  )
}
