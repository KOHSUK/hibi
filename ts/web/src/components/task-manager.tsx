"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  CalendarDays,
  Tag,
  Settings,
  FolderKanban,
  ArrowLeft,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type TaskStatus = "not_started" | "in_progress" | "completed" | "overdue"

export interface Task {
  id: string
  title: string
  status: TaskStatus
  dueDate?: string
  tags?: string[]
  priority?: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed"

interface ProjectContext {
  name: string
  description?: string
  status: ProjectStatus
  startDate?: string
  endDate?: string
}

interface TaskManagerProps {
  project?: ProjectContext
  initialTasks?: Task[]
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "プロダクトビジョンドキュメントの作成",
    status: "completed",
    dueDate: "2025-01-05",
    tags: ["ドキュメント", "計画"],
    priority: "high",
    createdAt: "2025-01-01T09:00:00Z",
    updatedAt: "2025-01-05T14:30:00Z",
  },
  {
    id: "2",
    title: "データベーススキーマ設計",
    status: "in_progress",
    dueDate: "2025-01-12",
    tags: ["開発", "データベース"],
    priority: "high",
    createdAt: "2025-01-06T10:00:00Z",
    updatedAt: "2025-01-08T16:20:00Z",
  },
  {
    id: "3",
    title: "Google Calendar API統合",
    status: "not_started",
    dueDate: "2025-01-15",
    tags: ["開発", "統合"],
    priority: "medium",
    createdAt: "2025-01-07T11:00:00Z",
    updatedAt: "2025-01-07T11:00:00Z",
  },
  {
    id: "4",
    title: "UIデザインレビュー",
    status: "overdue",
    dueDate: "2025-01-06",
    tags: ["デザイン", "レビュー"],
    priority: "high",
    createdAt: "2025-01-03T13:00:00Z",
    updatedAt: "2025-01-06T09:00:00Z",
  },
  {
    id: "5",
    title: "LLMプロンプトの最適化",
    status: "in_progress",
    dueDate: "2025-01-10",
    tags: ["AI", "開発"],
    priority: "medium",
    createdAt: "2025-01-05T15:00:00Z",
    updatedAt: "2025-01-08T10:15:00Z",
  },
]

const statusConfig = {
  not_started: {
    label: "未着手",
    icon: Circle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  in_progress: {
    label: "進行中",
    icon: Clock,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  completed: {
    label: "完了",
    icon: CheckCircle2,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  overdue: {
    label: "期限超過",
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
}

const projectStatusConfig: Record<ProjectStatus, { label: string; badgeClass: string }> = {
  planning: { label: "計画中", badgeClass: "bg-chart-3/10 text-chart-3" },
  in_progress: { label: "進行中", badgeClass: "bg-chart-1/10 text-chart-1" },
  on_hold: { label: "保留中", badgeClass: "bg-muted text-muted-foreground" },
  completed: { label: "完了", badgeClass: "bg-chart-2/10 text-chart-2" },
}

const priorityConfig = {
  low: { label: "低", color: "text-muted-foreground" },
  medium: { label: "中", color: "text-chart-3" },
  high: { label: "高", color: "text-chart-5" },
}

export function TaskManager({ project, initialTasks }: TaskManagerProps) {
  const [tasks] = useState<Task[]>(initialTasks ?? mockTasks)
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    all: tasks.length,
    not_started: tasks.filter((t) => t.status === "not_started").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  }

  const headerTitle = project ? `${project.name}のタスク` : "タスク"
  const headerSubtitle =
    project?.description || "Notion風の柔軟なプロパティでタスクを管理"
  const projectStatusState = project ? projectStatusConfig[project.status] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/projects">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="bg-white text-foreground shadow-sm hover:bg-white/90"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-xl font-semibold text-foreground">{headerTitle}</h1>
                {projectStatusState && (
                  <Badge variant="secondary" className={cn("px-2 py-0 text-[11px]", projectStatusState.badgeClass)}>
                    {projectStatusState.label}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{headerSubtitle}</p>
              {project && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
                  {project.startDate && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {project.startDate}
                      {project.endDate ? ` 〜 ${project.endDate}` : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                プロパティ設定
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                新規タスク
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        {/* Filters and Search */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="タスクを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            フィルタ
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="mb-4 flex items-center gap-2 border-b border-border">
          {(["all", "not_started", "in_progress", "completed", "overdue"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "relative px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                selectedStatus === status ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {status === "all" ? "すべて" : statusConfig[status].label}
              <span className="ml-2 text-xs text-muted-foreground">{statusCounts[status]}</span>
              {selectedStatus === status && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-1.5">
          {filteredTasks.map((task) => {
            const StatusIcon = statusConfig[task.status].icon
            return (
              <div
                key={task.id}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  <StatusIcon className={cn("h-4 w-4", statusConfig[task.status].color)} />
                </div>

                {/* Task Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="truncate text-sm font-medium text-foreground">{task.title}</h3>
                    <Badge
                      variant="secondary"
                      className={cn("px-2 py-0 text-[11px]", statusConfig[task.status].bgColor, statusConfig[task.status].color)}
                    >
                      {statusConfig[task.status].label}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground sm:text-xs">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{task.dueDate}</span>
                      </div>
                    )}
                    {task.priority && (
                      <div className="flex items-center gap-1">
                        <span className={cn("font-medium", priorityConfig[task.priority].color)}>
                          優先度: {priorityConfig[task.priority].label}
                        </span>
                      </div>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <div className="flex gap-1">
                          {task.tags.map((tag) => (
                            <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="size-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>編集</DropdownMenuItem>
                      <DropdownMenuItem>複製</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">削除</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-2.5">
              <Circle className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-foreground">タスクが見つかりません</h3>
            <p className="mt-1 text-sm text-muted-foreground">検索条件を変更するか、新しいタスクを作成してください</p>
          </div>
        )}
      </div>
    </div>
  )
}
