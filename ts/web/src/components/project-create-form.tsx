"use client"

import { type ProjectStatus } from "@/data/mock-projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"

export type ProjectFormState = {
  name: string
  description: string
  status: ProjectStatus
  startDate: string
  endDate: string
}

type ProjectCreateFormProps = {
  form: ProjectFormState
  onFieldChange: <K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function ProjectCreateForm({ form, onFieldChange, onSubmit }: ProjectCreateFormProps) {
  return (
    <Card className="mb-8 border border-dashed border-border/70 bg-muted/20 p-5 gap-3">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onSubmit}>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">プロジェクト名</label>
          <Input
            placeholder="例: MVP 基盤構築"
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            required
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">概要</label>
          <Input
            placeholder="目的やスコープを入力"
            value={form.description}
            onChange={(event) => onFieldChange("description", event.target.value)}
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">ステータス</label>
          <select
            value={form.status}
            onChange={(event) => onFieldChange("status", event.target.value as ProjectStatus)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="planning">計画中</option>
            <option value="in_progress">進行中</option>
            <option value="on_hold">保留中</option>
            <option value="completed">完了</option>
          </select>
        </div>
        <div className="flex gap-2 sm:w-auto">
          <Button type="submit" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            プロジェクト追加
          </Button>
        </div>
      </form>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">開始日</label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(event) => onFieldChange("startDate", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">終了予定日</label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(event) => onFieldChange("endDate", event.target.value)}
          />
        </div>
      </div>
    </Card>
  )
}
