"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/route-guards";
import { createClient } from "@/lib/supabase/client";
import TaskDiscovery from "@/components/dashboard/task-discovery";
import { Loader2 } from "lucide-react";
// import type { Profile } from "@/lib/types/database" // Warning: This might not exist yet. I should assume it does or define it locally to be safe, or just use 'any' if I can't find it. The user snippet imports it. I will keep the import but if it fails I'll need to fix it.
// Checking file listing earlier... `lib/types` existed. `lib/types/database` might not.
// I will defining the interface locally as per user snippet "Profiles Table Structure" block which had an interface.
// Actually, better to import if it exists, but since I can't be sure, I'll define it or use 'any'.
// User snippet had `import type { Profile } from "@/lib/types/database"`.
// I will try to use `any` for profile initially to avoid build error if type is missing, OR define the interface inline if I want to be strict.
// User snippet provided interface Profile. I will add it to `lib/types/database.ts` if it doesn't exist?
// No, I will just define it locally for now to ensure this file works, or create the types file.
// Let's create the types file first in a separate tool call if needed?
// Actually, I'll just define it inline to match the snippet perfectly? No, snippet imports it.
// I'll define it inline to be safe.

interface Profile {
  id: string; // Firebase UID (PRIMARY KEY)
  display_name: string; // From Firebase
  phone: string | null; // Optional
  avatar_url: string | null; // From Google OAuth
  role: "citizen" | "admin" | "verifier";
  total_tokens: number;
  total_xp: number;
  current_streak: number;
  tasks_completed: number;
  tasks_verified: number;
  created_at: string; // timestamp usually comes as string from JSON
  updated_at: string;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.uid).single();

      if (error) {
        console.error("[Dashboard] Profile fetch error:", JSON.stringify(error, null, 2));
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("[Dashboard] Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">Unable to load your profile. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return <TaskDiscovery profile={profile} />;
}
