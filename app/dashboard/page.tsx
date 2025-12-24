"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { createClient } from "@/lib/supabase/client"
import TaskDiscovery from "@/components/dashboard/task-discovery"
import type { Profile } from "@/lib/types/database"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    const fetchProfile = async () => {
      if (!user) return

      try {
        // Try to fetch profile from Supabase by Firebase UID
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.uid)
          .single()

        if (error || !data) {
          // Fallback/Mock profile if the user exists in Firebase but not in Supabase yet
          const mockProfile: Profile = {
            id: user.uid,
            display_name: user.displayName || user.email?.split("@")[0] || "User",
            full_name: user.displayName || "",
            role: "citizen",
            total_tokens: 0,
            total_xp: 0,
            level: 1,
            current_streak: 0,
            longest_streak: 0,
            verification_level: 1,
            tasks_completed: 0,
            tasks_verified: 0,
            impact_score: 0,
            phone: "",
            avatar_url: user.photoURL || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setProfile(mockProfile)
        } else {
          setProfile(data)
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user, authLoading, router, supabase])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return <TaskDiscovery profile={profile} />
}
