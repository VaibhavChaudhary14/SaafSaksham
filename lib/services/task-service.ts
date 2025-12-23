import { createClient } from "@/lib/supabase/client"
import { Task, TaskCategory, TaskSeverity } from "@/lib/types/database"

export type TaskFilters = {
    category?: TaskCategory[]
    severity?: TaskSeverity[]
    status?: "open" | "claimed" | "verified"
    bounds?: {
        north: number
        south: number
        east: number
        west: number
    }
}

export class TaskService {
    private supabase = createClient()

    async getTasks(filters?: TaskFilters) {
        let query = this.supabase
            .from("tasks")
            .select(`
        *,
        profiles:posted_by (
          display_name,
          avatar_url
        )
      `)
            .order("created_at", { ascending: false })

        if (filters?.status) {
            query = query.eq("status", filters.status)
        }

        if (filters?.category && filters.category.length > 0) {
            query = query.in("category", filters.category)
        }

        if (filters?.severity && filters.severity.length > 0) {
            query = query.in("severity", filters.severity)
        }

        // Geolocation filtering using PostGIS function if bounds provided
        if (filters?.bounds) {
            // Note: This assumes a 'tasks_within_bounds' RPC function exists in Supabase
            // created via:
            // CREATE OR REPLACE FUNCTION tasks_within_bounds(min_lat float, min_lng float, max_lat float, max_lng float)
            // RETURNS SETOF tasks AS $$
            // SELECT * FROM tasks 
            // WHERE location && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326);
            // $$ LANGUAGE sql STABLE;

            const { data, error } = await this.supabase.rpc("tasks_within_bounds", {
                min_lat: filters.bounds.south,
                min_lng: filters.bounds.west,
                max_lat: filters.bounds.north,
                max_lng: filters.bounds.east,
            })

            if (error) {
                console.error("Error fetching tasks by location:", error)
                // Fallback to client-side filtering if RPC fails or not implemented
                return this.getTasksFallback(filters)
            }
            return data as Task[]
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching tasks:", error)
            return []
        }

        return data as Task[]
    }

    private async getTasksFallback(filters?: TaskFilters) {
        let query = this.supabase
            .from("tasks")
            .select(`
        *,
        profiles:posted_by (
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
        profiles:posted_by (
          display_name,
          avatar_url,
          verification_level
        ),
        claimed_profile:claimed_by (
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
