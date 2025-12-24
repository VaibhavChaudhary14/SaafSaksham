"use client"

import React from "react"
import { useState, useEffect } from "react"
import { auth } from "@/lib/firebase/config"
import { useAuth } from "@/context/AuthContext"
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function SignUpPage() {
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"citizen" | "verifier">("citizen")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with full name
      await updateProfile(user, {
        displayName: fullName,
      })

      // Create profile in Supabase
      const supabase = createClient()
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.uid,
          display_name: fullName,
          full_name: fullName,
          phone: phone,
          role: role,
          total_tokens: 0,
          total_xp: 0,
          level: 1,
          current_streak: 0,
          longest_streak: 0,
          verification_level: 1,
          tasks_completed: 0,
          tasks_verified: 0,
          impact_score: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])

      if (profileError) {
        console.error("Supabase profile creation error:", profileError)
        // We don't block the user if profile creation fails, as the dashboard has a fallback mock
        toast.info("Account created, but profile sync failed.")
      } else {
        toast.success("Account created successfully!")
      }

      // No explicit redirect needed - useEffect will handle it
    } catch (error: unknown) {
      console.error(error)
      let errorMessage = "Failed to create account. Please try again."
      setIsLoading(false) // Only stop loading on error

      if (typeof error === "object" && error !== null && "code" in error) {
        const errorCode = (error as { code: string }).code
        if (errorCode === "auth/email-already-in-use") {
          errorMessage = "This email is already registered. Please log in instead."
        } else if (errorCode === "auth/weak-password") {
          errorMessage = "Password should be at least 6 characters long."
        } else if (errorCode === "auth/invalid-email") {
          errorMessage = "Please enter a valid email address."
        }
      }

      toast.error(errorMessage)
    }
  }

  const handleGoogleSignIn = async () => {
    if (isLoading) return
    setIsLoading(true)

    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      toast.success("Signed up with Google")
      // No explicit redirect needed
    } catch (error: unknown) {
      setIsLoading(false)
      let errorMessage = "Google sign-in failed"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0A0B] py-12">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />

      <div className="relative z-10 w-full max-w-lg px-6">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-lg shadow-primary/25 transition-transform duration-300 hover:scale-110">
            <Sparkles className="h-8 w-8 text-white transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Join SaafSaksham</h1>
            <p className="mt-2 text-muted-foreground">Start your journey towards a cleaner environment</p>
          </div>
        </div>

        <Card className="border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-white">Create Account</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/80">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" university-id="password" className="text-white/80">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="px-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-white/80">I want to</Label>
                <Select value={role} onValueChange={(value: "citizen" | "verifier") => setRole(value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-primary/20 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1B] border-white/10 text-white">
                    <SelectItem value="citizen" className="focus:bg-primary/20">Complete Tasks (Citizen)</SelectItem>
                    <SelectItem value="verifier" className="focus:bg-primary/20">Verify Tasks (Verifier)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="group w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 shadow-lg shadow-primary/20 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0A0A0B] px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all duration-300"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                Google
              </Button>
            </div>
          </CardContent>

          <div className="bg-white/5 py-4 px-8 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
