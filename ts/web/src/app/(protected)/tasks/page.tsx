import { TaskManager } from "@/components/task-manager"
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mockProjects } from "@/data/mock-projects";

export default async function TasksPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const aggregatedTasks = mockProjects.flatMap((project) => project.tasks);

  return (
      <TaskManager initialTasks={aggregatedTasks} />
  )
}
