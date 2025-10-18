"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { mockProjects, type Project, type ProjectStatus } from "@/data/mock-projects"
import { ProjectCreateForm, type ProjectFormState } from "@/components/project-create-form"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const statusConfig: Record<ProjectStatus, { label: string; badgeClass: string }> = {
  planning: { label: "計画中", badgeClass: "bg-chart-3/10 text-chart-3" },
  in_progress: { label: "進行中", badgeClass: "bg-chart-1/10 text-chart-1" },
  on_hold: { label: "保留中", badgeClass: "bg-muted text-muted-foreground" },
  completed: { label: "完了", badgeClass: "bg-chart-2/10 text-chart-2" },
}

const emptyForm: ProjectFormState = {
  name: "",
  description: "",
  status: "planning",
  startDate: "",
  endDate: "",
}

export function ProjectManager() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [newProject, setNewProject] = useState<ProjectFormState>(emptyForm)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ProjectFormState>(emptyForm)

  const handleNewProjectChange = <K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) => {
    setNewProject((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newProject.name.trim()) {
      return
    }

    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `project-${Date.now()}`

    const projectToAdd: Project = {
      id,
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      status: newProject.status,
      startDate: newProject.startDate,
      endDate: newProject.endDate ? newProject.endDate : undefined,
      tasks: [],
    }

    setProjects((prev) => [projectToAdd, ...prev])
    setNewProject(emptyForm)
  }

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))
    if (editingProjectId === id) {
      setEditingProjectId(null)
    }
  }

  const handleStartEdit = (project: Project, event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation()
    setEditingProjectId(project.id)
    setEditForm({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate ?? "",
    })
  }

  const handleCancelEdit = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation()
    setEditingProjectId(null)
    setEditForm(emptyForm)
  }

  const handleEditChange = <K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpdateProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingProjectId) {
      return
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === editingProjectId
          ? {
              ...project,
              name: editForm.name.trim(),
              description: editForm.description.trim(),
              status: editForm.status,
              startDate: editForm.startDate,
              endDate: editForm.endDate ? editForm.endDate : undefined,
            }
          : project
      )
    )
    setEditingProjectId(null)
    setEditForm(emptyForm)
  }

  const summary = useMemo(() => {
    const total = projects.length
    const inProgress = projects.filter((project) => project.status === "in_progress").length
    const planning = projects.filter((project) => project.status === "planning").length
    const completed = projects.filter((project) => project.status === "completed").length
    return { total, inProgress, planning, completed }
  }, [projects])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">プロジェクト</h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">プロジェクト単位でタスク進捗を整理・管理します</p>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground sm:text-sm">
              <div>総数: {summary.total}</div>
              <div>進行中: {summary.inProgress}</div>
              <div>計画中: {summary.planning}</div>
              <div>完了: {summary.completed}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <ProjectCreateForm form={newProject} onFieldChange={handleNewProjectChange} onSubmit={handleCreateProject} />

        <div className="space-y-3 gap-1.5 flex flex-col">
          {projects.map((project) => {
            const isEditing = editingProjectId === project.id
            const status = statusConfig[isEditing ? editForm.status : project.status]

            if (isEditing) {
              return (
                <Card key={project.id} className="border border-primary/50 bg-card p-3 mb-0">
                  <form className="space-y-3" onSubmit={handleUpdateProject}>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">プロジェクト名</label>
                        <Input
                          value={editForm.name}
                          onChange={(event) => handleEditChange("name", event.target.value)}
                          required
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">ステータス</label>
                        <select
                          value={editForm.status}
                          onChange={(event) => handleEditChange("status", event.target.value as ProjectStatus)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="planning">計画中</option>
                          <option value="in_progress">進行中</option>
                          <option value="on_hold">保留中</option>
                          <option value="completed">完了</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">概要</label>
                      <textarea
                        value={editForm.description}
                        onChange={(event) => handleEditChange("description", event.target.value)}
                        className="h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">開始日</label>
                        <Input
                          type="date"
                          value={editForm.startDate}
                          onChange={(event) => handleEditChange("startDate", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">終了予定日</label>
                        <Input
                          type="date"
                          value={editForm.endDate}
                          onChange={(event) => handleEditChange("endDate", event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                        キャンセル
                      </Button>
                      <Button type="submit">更新する</Button>
                    </div>
                  </form>
                </Card>
              )
            }

            return (
              <ProjectCard
                key={project.id}
                project={project}
                status={status}
                onSelect={() => router.push(`/projects/${project.id}/tasks`)}
                onEdit={(event) => handleStartEdit(project, event)}
                onDelete={(event) => {
                  event.stopPropagation()
                  handleDeleteProject(project.id)
                }}
              />
            )
          })}

          {projects.length === 0 && (
            <Card className="border border-dashed border-border/70 bg-card/50 p-6 text-center text-sm text-muted-foreground">
              <p>プロジェクトがまだありません。上部のフォームから追加を開始してください。</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
