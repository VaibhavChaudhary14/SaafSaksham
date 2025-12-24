"use client"

import * as React from "react"
import { auth } from "@/lib/firebase/config"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface OAuthButtonsProps {
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    actionPrefix?: string
}

export function OAuthButtons({ isLoading, setIsLoading, actionPrefix = "Continue" }: OAuthButtonsProps) {
    const router = useRouter()

    const handleGoogleLogin = async () => {
        if (isLoading) return
        setIsLoading(true)

        const provider = new GoogleAuthProvider()
        // Force account selection for better UX (Notion-style)
        provider.setCustomParameters({
            prompt: "select_account"
        })

        try {
            await signInWithPopup(auth, provider)
            toast.success("Logged in with Google")
            router.replace("/dashboard")
        } catch (error: unknown) {
            let errorMessage = "Google sign-in failed"
            if (error instanceof Error) {
                errorMessage = error.message
            }
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            <Button
                variant="outline"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 py-5 font-normal h-12"
            >
                {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                    <>
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span className="text-base">{actionPrefix} with Google</span>
                    </>
                )}
            </Button>
        </div>
    )
}
