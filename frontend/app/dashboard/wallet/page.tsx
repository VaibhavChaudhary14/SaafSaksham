import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TokenWallet from "@/components/dashboard/token-wallet"

export default async function WalletPage() {
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

  // Fetch token transactions
  const { data: transactions } = await supabase
    .from("token_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch redemption history
  const { data: redemptions } = await supabase
    .from("redemptions")
    .select(
      `
      *,
      csr_partners(name)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <TokenWallet profile={profile} transactions={transactions || []} redemptions={redemptions || []} />
}
