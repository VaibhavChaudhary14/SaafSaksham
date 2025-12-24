"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { auth } from "@/lib/firebase/config"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { signupSchema, type SignupValues } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OAuthButtons } from "@/components/auth/oauth-buttons"

export function SignupForm() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const router = useRouter()

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            password: "",
            role: "citizen",
        },
    })

    async function onSubmit(data: SignupValues) {
        setIsLoading(true)

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
            const user = userCredential.user

            await updateProfile(user, {
                displayName: data.fullName,
            })

            const supabase = createClient()
            const { error: profileError } = await supabase.from("profiles").insert([
                {
                    id: user.uid,
                    display_name: data.fullName,
                    full_name: data.fullName,
                    phone: data.phone,
                    role: data.role,
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
                toast.info("Account created, but profile sync failed.")
            } else {
                toast.success("Account created successfully!")
            }

            router.replace("/dashboard")
        } catch (error: unknown) {
            console.error(error)
            let errorMessage = "Failed to create account. Please try again."

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
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("grid gap-6")}>
            <OAuthButtons isLoading={isLoading} setIsLoading={setIsLoading} actionPrefix="Sign up" />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#F7F7F5] dark:bg-[#191919] px-2 text-gray-500">Or sign up with email</span>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-900 dark:text-gray-100">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            disabled={isLoading}
                            className="h-11 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-black focus:ring-black dark:focus:border-white dark:focus:ring-white transition-all shadow-sm"
                            {...form.register("fullName")}
                        />
                        {form.formState.errors.fullName && (
                            <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email Address</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            disabled={isLoading}
                            className="h-11 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-black focus:ring-black dark:focus:border-white dark:focus:ring-white transition-all shadow-sm"
                            {...form.register("email")}
                        />
                        {form.formState.errors.email && (
                            <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-900 dark:text-gray-100">Phone (Optional)</Label>
                        <Input
                            id="phone"
                            placeholder="+91 98765 43210"
                            type="tel"
                            disabled={isLoading}
                            className="h-11 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-black focus:ring-black dark:focus:border-white dark:focus:ring-white transition-all shadow-sm"
                            {...form.register("phone")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" university-id="password" className="text-gray-900 dark:text-gray-100">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
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
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-900 dark:text-gray-100">I want to</Label>
                    <Select
                        onValueChange={(value) => form.setValue("role", value as "citizen" | "verifier")}
                        defaultValue="citizen"
                    >
                        <SelectTrigger className="h-11 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-black dark:focus:ring-white transition-all shadow-sm">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#1A1A1B] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                            <SelectItem value="citizen" className="focus:bg-gray-100 dark:focus:bg-white/10">Complete Tasks (Citizen)</SelectItem>
                            <SelectItem value="verifier" className="focus:bg-gray-100 dark:focus:bg-white/10">Verify Tasks (Verifier)</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.role && (
                        <p className="text-xs text-red-500">{form.formState.errors.role.message}</p>
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
        </div>
    )
}
