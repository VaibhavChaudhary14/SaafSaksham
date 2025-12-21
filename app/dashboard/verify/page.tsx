import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import VerificationQueue from "@/components/dashboard/verification-queue"

export default async function VerifyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "verifier" && profile.role !== "admin")) {
    redirect("/dashboard")
  }

  // Fetch submitted tasks with proofs
  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      `
      *,
      profiles!tasks_claimed_by_fkey(full_name, avatar_url)
    `,
    )
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true })

  return <VerificationQueue tasks={tasks || []} profile={profile} />
}
