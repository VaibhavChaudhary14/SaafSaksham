"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    children: React.ReactNode
}

export function AuthCard({ className, title, description, children, ...props }: AuthCardProps) {
    return (
        <Card className={cn("w-full max-w-[400px] border-none shadow-none bg-transparent sm:bg-white sm:border sm:border-gray-200 sm:shadow-sm", className)} {...props}>
            <CardHeader className="space-y-1 px-0 sm:px-6">
                <CardTitle className="text-2xl font-semibold tracking-tight text-center sm:text-left text-[#1A1A1B]">
                    {title}
                </CardTitle>
                {description && (
                    <CardDescription className="text-center sm:text-left text-gray-500">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
                {children}
            </CardContent>
        </Card>
    )
}
