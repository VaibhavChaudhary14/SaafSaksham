import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminDashboard from "@/components/dashboard/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch platform statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalTasks } = await supabase.from("tasks").select("*", { count: "exact", head: true })

  const { count: completedTasks } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "verified")

  const { count: pendingVerifications } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted")

  const { data: recentTasks } = await supabase
    .from("tasks")
    .select(
      `
      *,
      profiles!tasks_claimed_by_fkey(full_name, avatar_url)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10)

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  const { data: tokenStats } = await supabase.from("tokens").select("amount, transaction_type")

  return (
    <AdminDashboard
      profile={profile}
      stats={{
        totalUsers: totalUsers || 0,
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        pendingVerifications: pendingVerifications || 0,
        tokensEarned:
          tokenStats?.filter((t) => t.transaction_type === "earned").reduce((sum, t) => sum + t.amount, 0) || 0,
        tokensRedeemed:
          tokenStats
            ?.filter((t) => t.transaction_type === "redeemed")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0,
      }}
      recentTasks={recentTasks || []}
      recentUsers={recentUsers || []}
    />
  )
}
