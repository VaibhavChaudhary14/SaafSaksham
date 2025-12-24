"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Auto-redirect if already logged in
  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard") // Use replace to prevent back-button loops
    }
  }, [user, authLoading, router])

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0A0B]">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-lg shadow-primary/25 transition-transform duration-300 hover:scale-110">
            <Sparkles className="h-8 w-8 text-white transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">SaafSaksham</h1>
            <p className="mt-2 text-muted-foreground">Empowering clean and sustainable communities</p>
          </div>
        </div>

        <Card className="border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-white">Login</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <LoginForm />
          </CardContent>

          <div className="bg-white/5 py-4 px-8 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/sign-up" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
