import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import VerifyTaskDetail from "@/components/dashboard/verify-task-detail"

export default async function VerifyTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

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

  const { data: task } = await supabase
    .from("tasks")
    .select(
      `
      *,
      submitted_by:claimed_by (
        id,
        display_name,
        avatar_url,
        role
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!task) {
    redirect("/dashboard/verify")
  }

  // Fetch proofs
  const { data: proofs } = await supabase
    .from("task_proofs")
    .select("*")
    .eq("task_id", id)
    .order("proof_type", { ascending: true })

  return <VerifyTaskDetail task={task} proofs={proofs || []} profile={profile} />
}
