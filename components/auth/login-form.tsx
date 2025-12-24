"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { auth } from "@/lib/firebase/config"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { loginSchema, type LoginValues } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import Link from "next/link"

export function LoginForm() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const router = useRouter()

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: LoginValues) {
        setIsLoading(true)

        try {
            await signInWithEmailAndPassword(auth, data.email, data.password)
            toast.success("Welcome back!")
            router.push("/dashboard")
        } catch (error: unknown) {
            console.error(error)
            setIsLoading(false)
            let errorMessage = "Failed to login. Please check your credentials."

            if (typeof error === "object" && error !== null && "code" in error) {
                const errorCode = (error as { code: string }).code
                if (errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
                    errorMessage = "Invalid email or password. Please try again."
                } else if (errorCode === "auth/too-many-requests") {
                    errorMessage = "Too many failed attempts. Please try again later."
                }
            }

            toast.error(errorMessage)
        }
    }

    return (
        <div className={cn("grid gap-6")}>
            <OAuthButtons isLoading={isLoading} setIsLoading={setIsLoading} actionPrefix="Continue" />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0A0A0B] px-2 text-muted-foreground">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                            {...form.register("email")}
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" university-id="password" className="text-white/80">Password</Label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="px-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
                            {...form.register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="group w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 shadow-lg shadow-primary/20 transition-all duration-300"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Signing in...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <span>Sign In</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    )}
                </Button>
            </form>
        </div>
    )
}
