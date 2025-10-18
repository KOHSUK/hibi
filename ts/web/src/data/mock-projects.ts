export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed"

export type ProjectTaskStatus = "not_started" | "in_progress" | "completed" | "overdue"

export interface ProjectTask {
  id: string
  title: string
  status: ProjectTaskStatus
  dueDate?: string
  tags?: string[]
  priority?: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  startDate: string
  endDate?: string
  tasks: ProjectTask[]
}

export const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "MVP 基盤構築",
    description: "カレンダー・TODO・ストレージ連携を含む MVP の土台構築を進める。",
    status: "in_progress",
    startDate: "2024-12-01",
    endDate: "2025-02-28",
    tasks: [
      {
        id: "task-1",
        title: "プロダクトビジョンドキュメントの作成",
        status: "completed",
        dueDate: "2025-01-05",
        tags: ["ドキュメント", "計画"],
        priority: "high",
        createdAt: "2025-01-01T09:00:00Z",
        updatedAt: "2025-01-05T14:30:00Z",
      },
      {
        id: "task-2",
        title: "データベーススキーマ設計",
        status: "in_progress",
        dueDate: "2025-01-12",
        tags: ["開発", "データベース"],
        priority: "high",
        createdAt: "2025-01-06T10:00:00Z",
        updatedAt: "2025-01-08T16:20:00Z",
      },
      {
        id: "task-3",
        title: "Google Calendar API統合",
        status: "not_started",
        dueDate: "2025-01-15",
        tags: ["開発", "統合"],
        priority: "medium",
        createdAt: "2025-01-07T11:00:00Z",
        updatedAt: "2025-01-07T11:00:00Z",
      },
    ],
  },
  {
    id: "project-2",
    name: "AI アシスト強化",
    description: "TODO 候補提案と日次要約の精度改善に向けたアシスト機能を試作する。",
    status: "planning",
    startDate: "2025-02-01",
    endDate: "2025-03-31",
    tasks: [
      {
        id: "task-4",
        title: "LLM プロンプトの最適化",
        status: "in_progress",
        dueDate: "2025-02-15",
        tags: ["AI", "開発"],
        priority: "medium",
        createdAt: "2025-01-20T15:00:00Z",
        updatedAt: "2025-01-28T10:15:00Z",
      },
      {
        id: "task-5",
        title: "要約評価の指標設計",
        status: "not_started",
        dueDate: "2025-02-20",
        tags: ["分析", "AI"],
        priority: "medium",
        createdAt: "2025-01-27T13:00:00Z",
        updatedAt: "2025-01-27T13:00:00Z",
      },
    ],
  },
  {
    id: "project-3",
    name: "ユーザーリサーチ",
    description: "Early adopter へのヒアリングと操作ログ分析を通じて UX 課題を特定する。",
    status: "on_hold",
    startDate: "2024-12-15",
    tasks: [
      {
        id: "task-6",
        title: "ヒアリングスクリプト作成",
        status: "completed",
        dueDate: "2024-12-22",
        tags: ["UX", "ドキュメント"],
        priority: "low",
        createdAt: "2024-12-18T09:00:00Z",
        updatedAt: "2024-12-22T10:00:00Z",
      },
      {
        id: "task-7",
        title: "初回インタビュー実施",
        status: "overdue",
        dueDate: "2025-01-10",
        tags: ["リサーチ"],
        priority: "high",
        createdAt: "2024-12-28T09:30:00Z",
        updatedAt: "2025-01-11T18:00:00Z",
      },
    ],
  },
]
