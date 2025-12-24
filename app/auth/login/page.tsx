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
    return null
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
