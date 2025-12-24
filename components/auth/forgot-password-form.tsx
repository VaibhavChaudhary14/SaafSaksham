"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { auth } from "@/lib/firebase/config"
import { sendPasswordResetEmail } from "firebase/auth"
import { toast } from "sonner"
import { Mail, ArrowRight } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSubmitted, setIsSubmitted] = React.useState(false)

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(data: ForgotPasswordValues) {
        setIsLoading(true)

        try {
            await sendPasswordResetEmail(auth, data.email)
            toast.success("Password reset email sent!")
            setIsSubmitted(true)
        } catch (error: unknown) {
            console.error(error)
            let errorMessage = "Failed to send reset email."

            if (typeof error === "object" && error !== null && "code" in error) {
                const errorCode = (error as { code: string }).code
                if (errorCode === "auth/user-not-found") {
                    // For security, we might want to pretend it worked, but for now user feedback is helpful
                    errorMessage = "No account found with this email."
                } else if (errorCode === "auth/invalid-email") {
                    errorMessage = "Invalid email address."
                }
            }

            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="space-y-6 text-center">
                <div className="bg-green-500/10 text-green-500 dark:text-green-400 p-4 rounded-lg text-sm">
                    We've sent a password reset link to <br />
                    <span className="font-semibold">{form.getValues("email")}</span>
                </div>
                <Button asChild className="w-full bg-[#1A1A1B] text-white hover:bg-[#2D2D2E] dark:bg-white dark:text-black">
                    <Link href="/auth/login">Back to Login</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className={cn("grid gap-6")}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email Address</Label>
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
                            className="pl-10 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-black focus:ring-black dark:focus:border-white dark:focus:ring-white transition-all shadow-sm"
                            {...form.register("email")}
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
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
                            <span>Sending link...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <span>Send Reset Link</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    )}
                </Button>
            </form>

            <div className="text-center">
                <Link href="/auth/login" className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    Back to Login
                </Link>
            </div>
        </div>
    )
}
