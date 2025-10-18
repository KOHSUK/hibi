import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectManager } from "@/components/project-manager"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect("/auth/login")
  }

  return <ProjectManager />
}
