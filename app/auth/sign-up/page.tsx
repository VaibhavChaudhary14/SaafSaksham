"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { SignupForm } from "@/components/auth/signup-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthCard } from "@/components/auth/auth-card"

export default function SignUpPage() {
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
        title="Create Account"
        description="Join the community for a cleaner environment"
      >
        <SignupForm />
      </AuthCard>
    </AuthLayout>
  )
}
