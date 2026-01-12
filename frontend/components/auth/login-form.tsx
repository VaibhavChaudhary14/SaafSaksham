"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { auth } from "@/lib/firebase/config"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, ArrowRight } from "lucide-react"

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
            router.replace("/dashboard")
        } catch (error: unknown) {
            console.error(error)
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
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("grid gap-6")}>
            <OAuthButtons isLoading={isLoading} setIsLoading={setIsLoading} actionPrefix="Continue" />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#F7F7F5] dark:bg-[#191919] px-2 text-gray-500">Or continue with email</span>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email Address</Label>
                    <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                        className="h-11 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-black focus:ring-black dark:focus:border-white dark:focus:ring-white transition-all shadow-sm"
                        {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" university-id="password" className="text-gray-900 dark:text-gray-100">Password</Label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="h-11 pr-10 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-black focus:ring-black dark:focus:border-white dark:focus:ring-white transition-all shadow-sm"
                            {...form.register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#1A1A1B] hover:bg-[#2D2D2E] dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-medium h-11 transition-all duration-200"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Signing in...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <span>Sign In</span>
                        </div>
                    )}
                </Button>
            </form>
        </div>
    )
}
