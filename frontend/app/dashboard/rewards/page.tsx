import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import RewardsCatalog from "@/components/dashboard/rewards-catalog"

export default async function RewardsPage() {
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

  // Fetch CSR partners and their rewards
  const { data: partners } = await supabase.from("csr_partners").select("*").eq("is_active", true)

  return <RewardsCatalog profile={profile} partners={partners || []} />
}
