import { createClient } from "@/lib/supabase/client"
import { TokenTransaction, Redemption } from "@/lib/types/database"

export class WalletService {
    private supabase = createClient()

    async getTransactions(userId: string) {
        const { data, error } = await this.supabase
            .from("token_transactions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching transactions:", error)
            return []
        }

        return data as TokenTransaction[]
    }

    async getRedemptions(userId: string) {
        const { data, error } = await this.supabase
            .from("redemptions")
            .select(`
        *,
        csr_partners (
          name
        )
      `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching redemptions:", error)
            return []
        }

        // Map the nested csr_partners to match UI expectations if needed, 
        // or just rely on the shape.
        return data as any[] // using any to bypass complex join typing for now, or define a variant
    }
}

export const walletService = new WalletService()
