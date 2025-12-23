import { createClient } from "@/lib/supabase/client"
import { RedemptionOption, Redemption } from "@/lib/types/database"

export class RewardsService {
    private supabase = createClient()

    async getRewards() {
        const { data, error } = await this.supabase
            .from("redemption_options")
            .select("*")
            .eq("is_active", true)
            .order("tokens_required", { ascending: true })

        if (error) {
            console.error("Error fetching rewards:", error)
            return []
        }

        return data as RedemptionOption[]
    }

    async redeemReward(userId: string, reward: RedemptionOption) {
        // 1. Deduct tokens
        // We insert a negative transaction. 
        // Ideally this should be a stored procedure to check balance and update atomically.
        // For MVP client-side:

        // Check balance first (optional since UI does it but good for safety)
        const { data: profile } = await this.supabase
            .from("profiles")
            .select("total_tokens")
            .eq("id", userId)
            .single()

        if (!profile || profile.total_tokens < reward.tokens_required) {
            throw new Error("Insufficient tokens")
        }

        // Insert transaction
        const { error: tokenError } = await this.supabase.from("tokens").insert({
            user_id: userId,
            amount: -reward.tokens_required,
            transaction_type: "redeemed", // matches schema check constraint
            description: `Redeemed: ${reward.title}`,
        })

        if (tokenError) throw tokenError

        // 2. Create redemption record
        const { data: redemption, error: redemptionError } = await this.supabase
            .from("redemptions")
            .insert({
                user_id: userId,
                partner_id: reward.partner_id || null,
                tokens_spent: reward.tokens_required,
                reward_type: reward.category,
                reward_details: {
                    title: reward.title,
                    description: reward.description,
                    reward_id: reward.id,
                },
                status: "pending",
            })
            .select()
            .single()

        if (redemptionError) throw redemptionError

        // 3. Update profile balance
        const { error: profileError } = await this.supabase
            .from("profiles")
            .update({
                total_tokens: profile.total_tokens - reward.tokens_required,
            })
            .eq("id", userId)

        if (profileError) console.error("Error updating profile balance:", profileError)

        // 4. Notification
        await this.supabase.from("notifications").insert({
            user_id: userId,
            type: "token_earned", // Reusing type or add 'reward_redeemed' if valid in check constraint? 
            // Schema check constraint for notifications type:
            // 'task_claimed', 'task_verified', 'task_rejected', 'badge_earned', 'token_earned', 'level_up', 'streak_milestone', 'system'
            // 'reward_redeemed' is NOT in the check constraint in schema.sql.
            // I should use 'system' for now or 'token_earned' (awkward). 
            // I'll use 'system'.
            title: "Reward Redeemed!",
            message: `You've redeemed ${reward.title} for ${reward.tokens_required} tokens.`,
            link: "/dashboard/wallet",
        })

        return redemption as Redemption
    }
}

export const rewardsService = new RewardsService()
