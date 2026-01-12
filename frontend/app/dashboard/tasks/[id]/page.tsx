import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TaskDetail from "@/components/dashboard/task-detail"

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const { data: task } = await supabase.from("tasks").select("*").eq("id", id).single()

  if (!task) {
    redirect("/dashboard")
  }

  // Fetch task proofs if user has claimed this task
  let proofs = []
  if (task.claimed_by === user.id) {
    const { data } = await supabase
      .from("task_proofs")
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: true })
    proofs = data || []
  }

  return <TaskDetail task={task} profile={profile} proofs={proofs} />
}
