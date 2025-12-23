import { createClient } from "@/lib/supabase/client"
import { Task, Verification, TaskProof } from "@/lib/types/database"

export class VerificationService {
    private supabase = createClient()

    async getPendingTasksForVerification(userId: string) {
        // In a real app, this should filter tasks not yet verified by THIS user
        // and where the user is eligible (e.g., area, reputation).
        // For MVP, we get all tasks with status 'submitted'.
        const { data, error } = await this.supabase
            .from("tasks")
            .select(`
        *,
        profiles:posted_by (
          display_name,
          avatar_url
        )
      `)
            .eq("status", "submitted")
            .neq("posted_by", userId) // Can't verify own task
            .order("submitted_at", { ascending: true })

        if (error) {
            console.error("Error fetching pending verifications:", error)
            return []
        }

        return data as Task[]
    }

    async getTaskProofs(taskId: string) {
        const { data, error } = await this.supabase
            .from("task_proofs")
            .select("*")
            .eq("task_id", taskId)
            .order("created_at", { ascending: true })

        if (error) throw error
        return data as TaskProof[]
    }

    async submitVerification(verification: Partial<Verification>, task: Task) {
        // 1. Create verification record
        const { data: verificationData, error: verificationError } = await this.supabase
            .from("verifications")
            .insert(verification)
            .select()
            .single()

        if (verificationError) throw verificationError

        const approved = verification.status === "approved"
        const taskStatus = approved ? "verified" : "rejected"

        // 2. Update task status
        const { error: taskError } = await this.supabase
            .from("tasks")
            .update({
                status: taskStatus,
                verified_at: approved ? new Date().toISOString() : null,
                verified_by: verification.verifier_id
            })
            .eq("id", task.id)

        if (taskError) throw taskError

        if (approved && task.claimed_by) {
            await this.handleApprovalRewards(task)
        } else if (!approved && task.claimed_by) {
            await this.handleRejectionNotification(task)
        }

        return verificationData as Verification
    }

    private async handleApprovalRewards(task: Task) {
        // 3. Award tokens
        const { error: tokensError } = await this.supabase.from("tokens").insert({
            user_id: task.claimed_by,
            task_id: task.id,
            amount: task.token_reward,
            transaction_type: "earned",
            description: `Task completed: ${task.title}`,
        })
        if (tokensError) console.error("Error awarding tokens:", tokensError)

        // 4. Update profile (XP, count, streak)
        // First fetch current stats to increment safely (or use an RPC in real world)
        const { data: currentProfile } = await this.supabase
            .from("profiles")
            .select("total_xp, total_tokens, tasks_completed, current_streak")
            .eq("id", task.claimed_by!) // asserted because of check above
            .single()

        if (currentProfile) {
            const { error: profileError } = await this.supabase
                .from("profiles")
                .update({
                    total_xp: currentProfile.total_xp + task.xp_reward,
                    total_tokens: currentProfile.total_tokens + task.token_reward,
                    tasks_completed: currentProfile.tasks_completed + 1,
                    current_streak: currentProfile.current_streak + 1, // Logic for streak reset is needed in real app
                })
                .eq("id", task.claimed_by!)

            if (profileError) console.error("Error updating profile stats:", profileError)
        }

        // 5. Notification
        await this.supabase.from("notifications").insert({
            user_id: task.claimed_by!,
            type: "task_verified",
            title: "Task Verified!",
            message: `Your task "${task.title}" has been verified. You earned ${task.token_reward} tokens and ${task.xp_reward} XP!`,
            link: `/dashboard/tasks/${task.id}`,
        })
    }

    private async handleRejectionNotification(task: Task) {
        await this.supabase.from("notifications").insert({
            user_id: task.claimed_by!,
            type: "task_rejected",
            title: "Task Rejected",
            message: `Your task "${task.title}" was rejected. Please review feedback.`,
            link: `/dashboard/tasks/${task.id}`,
        })
    }
}

export const verificationService = new VerificationService()
