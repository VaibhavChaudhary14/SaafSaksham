"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Guards routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            // Store intended destination
            sessionStorage.setItem("redirectAfterLogin", pathname);
            router.replace("/auth/login");
        }
    }, [loading, user, router, pathname]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Don't render protected content until auth is confirmed
    if (!user) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Guards routes that should only be accessible to unauthenticated users
 * Redirects to dashboard if user is already authenticated
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Check for stored redirect destination
            const redirectTo = sessionStorage.getItem("redirectAfterLogin");
            sessionStorage.removeItem("redirectAfterLogin");

            router.replace(redirectTo || "/dashboard");
        }
    }, [loading, user, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Don't render auth forms if already authenticated
    if (user) {
        return null;
    }

    return <>{children}</>;
}
