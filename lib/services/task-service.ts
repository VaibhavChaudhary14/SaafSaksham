import { createClient } from "@/lib/supabase/client"
import { Task, TaskCategory, TaskSeverity } from "@/lib/types/database"

export type TaskFilters = {
    category?: TaskCategory[]
    severity?: TaskSeverity[]
    status?: "open" | "claimed" | "verified"
    nearby?: {
        lat: number
        lng: number
        radius?: number // meters
    }
}

export class TaskService {
    private supabase = createClient()

    async getTasks(filters?: TaskFilters) {
        let query: any;

        // 1. Base Query Selection
        if (filters?.nearby) {
            // Use Geospatial RPC if location is provided
            query = this.supabase.rpc('get_nearby_tasks', {
                lat: filters.nearby.lat,
                long: filters.nearby.lng,
                radius_meters: filters.nearby.radius || 10000 // Default 10km
            })
        } else {
            // Standard Table Query
            query = this.supabase.from("tasks").select() // .select() handles the * implicitly for the base
        }

        // 2. Chain Relationships (Applies to both RPC and Table queries)
        // We re-state the select to ensure relations are always fetched
        // Note: For RPC, this works because the RPC returns SETOF tasks
        query = query.select(`
        *,
        profiles:profiles!posted_by (
          display_name,
          avatar_url
        )
      `)

        // 3. Apply Filters
        if (filters?.status) {
            query = query.eq("status", filters.status)
        } else if (!filters?.nearby) {
            // Default ordering for non-geo queries (Geo queries are already ordered by distance in RPC)
            query = query.order("created_at", { ascending: false })
        }

        if (filters?.category && filters.category.length > 0) {
            query = query.in("category", filters.category)
        }

        if (filters?.severity && filters.severity.length > 0) {
            query = query.in("severity", filters.severity)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching tasks:", JSON.stringify(error, null, 2))
            return []
        }

        return data as Task[]
    }


    private async getTasksFallback(filters?: TaskFilters) {
        let query = this.supabase
            .from("tasks")
            .select(`
        *,
        profiles:profiles!posted_by (
          display_name,
          avatar_url
        )
      `)
            .order("created_at", { ascending: false })

        if (filters?.status) query = query.eq("status", filters.status)

        const { data, error } = await query
        if (error) return []
        return data as Task[]
    }

    async getTaskById(id: string) {
        const { data, error } = await this.supabase
            .from("tasks")
            .select(`
        *,
        profiles:profiles!posted_by (
          display_name,
          avatar_url,
          verification_level
        ),
        claimed_profile:profiles!claimed_by (
          display_name,
          avatar_url
        )
      `)
            .eq("id", id)
            .single()

        if (error) {
            console.error("Error fetching task:", error)
            return null
        }

        return data as Task
    }

    async createTask(task: Partial<Task>) {
        const { data, error } = await this.supabase
            .from("tasks")
            .insert(task)
            .select()
            .single()

        if (error) throw error
        return data as Task
    }
}

export const taskService = new TaskService()
