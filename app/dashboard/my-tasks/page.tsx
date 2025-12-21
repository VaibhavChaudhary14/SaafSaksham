import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayout from "@/components/dashboard/layout"
import MyTasksList from "@/components/dashboard/my-tasks-list"

export default async function MyTasksPage() {
  const supabase = await createClient()

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

  // Fetch user's tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("claimed_by", user.id)
    .order("claimed_at", { ascending: false })

  return (
    <DashboardLayout profile={profile}>
      <MyTasksList tasks={tasks || []} />
    </DashboardLayout>
  )
}
