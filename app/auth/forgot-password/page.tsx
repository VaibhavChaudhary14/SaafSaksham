"use client"

import * as React from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthCard } from "@/components/auth/auth-card"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
    return (
        <AuthLayout>
            <AuthCard
                title="Reset Password"
                description="We'll send you a link to reset your password"
            >
                <ForgotPasswordForm />
            </AuthCard>
        </AuthLayout>
    )
}
