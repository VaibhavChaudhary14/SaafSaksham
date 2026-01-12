"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import Link from "next/link"

interface AuthLayoutProps {
    children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F7F7F5] dark:bg-[#191919] p-4 sm:p-8">
            <Link href="/" className="mb-8 flex items-center gap-2 transition-transform hover:scale-105">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                    <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg tracking-tight text-[#1A1A1B] dark:text-white">SaafSaksham</span>
            </Link>
            <main className="w-full max-w-[400px] space-y-4">
                {children}
            </main>
            <footer className="mt-8 text-center text-xs text-gray-400">
                <p>&copy; {new Date().getFullYear()} SaafSaksham. All rights reserved.</p>
            </footer>
        </div>
    )
}
