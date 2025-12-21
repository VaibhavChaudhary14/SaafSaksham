import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TaskDiscovery from "@/components/dashboard/task-discovery"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return <TaskDiscovery profile={profile} />
}
