"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
});

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase emits null initially, then the actual user state
        // This prevents race conditions during page loads
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Sync Firebase user with Supabase
                await syncUserWithSupabase(firebaseUser);
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Syncs Firebase user with Supabase database
 * Uses Firebase UID as primary identity
 */
async function syncUserWithSupabase(firebaseUser: User) {
    try {
        const supabase = createClient();

        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", firebaseUser.uid)
            .single();

        if (!existingProfile) {
            // Create profile using Firebase UID
            const { error } = await supabase.from("profiles").insert({
                id: firebaseUser.uid,
                display_name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                phone: firebaseUser.phoneNumber || null,
                avatar_url: firebaseUser.photoURL || null,
                role: "citizen",
                total_tokens: 0,
                total_xp: 0,
                current_streak: 0,
                tasks_completed: 0,
                tasks_verified: 0,
            });

            if (error) {
                console.error("[AuthContext] Profile creation error:", JSON.stringify(error, null, 2));
            }
        }
    } catch (error) {
        console.error("[AuthContext] Supabase sync error:", error);
    }
}
