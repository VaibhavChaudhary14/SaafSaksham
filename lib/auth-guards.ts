import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
// Note: In real Next.js apps, this is usually 'next/navigation' but for typing generic routers we can use 'any' or specific types
// Ideally we just pass the router instance from 'useRouter()'

interface AuthState {
    isAuthenticated: boolean;
    loading: boolean;
}

/**
 * Ensures the user is authenticated. 
 * If loading, returns 'true' to signal "wait".
 * If not authenticated, redirects to login and returns 'true' (stop rendering).
 * If authenticated, returns 'false' (allow rendering).
 */
export function requireAuth(router: any, { isAuthenticated, loading }: AuthState): boolean {
    if (loading) return true; // Wait for auth to resolve

    if (!isAuthenticated) {
        // Prevent back-button loops
        router.replace("/auth/login");
        return true; // Stop rendering
    }

    return false; // Render content
}

/**
 * Ensures the user is a guest (NOT authenticated).
 * If loading, returns 'true' to signal "wait".
 * If authenticated, redirects to dashboard and returns 'true' (stop rendering).
 */
export function requireGuest(router: any, { isAuthenticated, loading }: AuthState): boolean {
    if (loading) return true;

    if (isAuthenticated) {
        router.replace("/dashboard");
        return true;
    }

    return false;
}
