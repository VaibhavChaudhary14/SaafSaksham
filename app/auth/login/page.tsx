"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { LoginForm } from "@/components/auth/login-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthCard } from "@/components/auth/auth-card"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F5] dark:bg-[#191919]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Log in"
        description="Enter your email to access your account"
      >
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  )
}
