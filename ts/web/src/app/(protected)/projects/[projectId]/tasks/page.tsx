import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TaskManager } from "@/components/task-manager"
import { mockProjects } from "@/data/mock-projects"

interface ProjectTasksPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectTasksPage({ params }: ProjectTasksPageProps) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect("/auth/login")
  }

  const project = mockProjects.find((candidate) => candidate.id === params.projectId)

  if (!project) {
    return (
      <TaskManager
        project={{
          name: "未登録プロジェクト",
          description: "モックデータが未定義のため空のタスク一覧を表示しています。",
          status: "planning",
        }}
        initialTasks={[]}
      />
    )
  }

  return (
    <TaskManager
      project={{
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
      }}
      initialTasks={project.tasks}
    />
  )
}
