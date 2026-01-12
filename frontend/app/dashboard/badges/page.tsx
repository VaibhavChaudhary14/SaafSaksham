import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import BadgesView from "@/components/dashboard/badges-view"

export default async function BadgesPage() {
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

  // Fetch all badges
  const { data: allBadges } = await supabase.from("badges").select("*").order("required_count", { ascending: true })

  // Fetch user's earned badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select(
      `
      *,
      badges(*)
    `,
    )
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })

  return <BadgesView profile={profile} allBadges={allBadges || []} userBadges={userBadges || []} />
}
