import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LeaderboardView from "@/components/dashboard/leaderboard-view"

export default async function LeaderboardPage() {
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

  // Fetch top 50 users from leaderboard
  const { data: leaderboardData } = await supabase
    .from("leaderboard")
    .select("*")
    .order("global_rank", { ascending: true })
    .limit(50)

  // Find current user's ranking
  const { data: userRanking } = await supabase.from("leaderboard").select("*").eq("user_id", user.id).single()

  return <LeaderboardView profile={profile} leaderboardData={leaderboardData || []} userRanking={userRanking} />
}
