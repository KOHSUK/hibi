"use client"

import type { MouseEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Project } from "@/data/mock-projects"
import { CalendarDays, FolderKanban, Pencil, Trash2 } from "lucide-react"

type ProjectCardStatus = {
  label: string
  badgeClass: string
}

type ProjectCardProps = {
  project: Project
  status: ProjectCardStatus
  onSelect: () => void
  onEdit: (event: MouseEvent<HTMLButtonElement>) => void
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void
}

export function ProjectCard({ project, status, onSelect, onEdit, onDelete }: ProjectCardProps) {
  const completedTasks = project.tasks.filter((task) => task.status === "completed").length
  const totalTasks = project.tasks.length
  const progressText = totalTasks > 0 ? `${completedTasks}/${totalTasks} タスク完了` : "タスク未登録"

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "group cursor-pointer border border-border bg-card transition-colors hover:bg-accent/50 p-3 mb-0"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-start gap-3">
          <div className="hidden rounded-md bg-primary/10 p-2 text-primary sm:block">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-medium text-foreground sm:text-md">{project.name}</h2>
              <Badge variant="secondary" className={cn("px-2 py-0 text-[11px]", status.badgeClass)}>
                {status.label}
              </Badge>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description || "説明未設定"}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {project.startDate}
                  {project.endDate ? ` 〜 ${project.endDate}` : ""}
                </span>
              </div>
              <div>{progressText}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="group-hover:bg-accent/50 group-hover:text-primary cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" />
            編集
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive cursor-pointer" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
        </div>
      </div>
    </Card>
  )
}
