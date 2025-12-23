import { createClient } from "@/lib/supabase/client"
import { LeaderboardEntry, Badge, UserBadge } from "@/lib/types/database"

export class GamificationService {
    private supabase = createClient()

    async getLeaderboard(limit = 100) {
        // Determine if we should query the materialized view or table. A view is safer.
        // Schema has 'leaderboard' materialized view.
        const { data, error } = await this.supabase
            .from("leaderboard")
            .select("*")
            .order("global_rank", { ascending: true })
            .limit(limit)

        if (error) {
            console.error("Error fetching leaderboard:", error)
            return []
        }

        return data as LeaderboardEntry[]
    }

    async getAllBadges() {
        const { data, error } = await this.supabase
            .from("badges")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true })

        if (error) {
            console.error("Error fetching badges:", error)
            return []
        }
        return data as Badge[]
    }

    async getUserBadges(userId: string) {
        const { data, error } = await this.supabase
            .from("user_badges")
            .select(`
        *,
        badges (*)
      `)
            .eq("user_id", userId)

        if (error) {
            console.error("Error fetching user badges:", error)
            return []
        }

        return data as any[] // Join typing complexity
    }
}

export const gamificationService = new GamificationService()
