"use client"

import type { Profile } from "@/lib/types/database"
import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/config"
import { signOut } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sparkles, Home, MapPin, CheckCircle, Coins, Trophy, User, LogOut, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardLayoutProps {
  children: React.ReactNode
  profile: Profile
}

export default function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Discover" },
    { href: "/dashboard/my-tasks", icon: MapPin, label: "My Tasks" },
    {
      href: "/dashboard/verify",
      icon: CheckCircle,
      label: "Verify",
      badge: profile.role === "verifier" || profile.role === "admin",
    },
    { href: "/dashboard/rewards", icon: Coins, label: "Rewards" },
    { href: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">SaafSaksham</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map(
              (item) =>
                (!item.badge || (item.badge && (profile.role === "verifier" || profile.role === "admin"))) && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ),
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col gap-2 p-2">
                  <p className="text-sm font-medium">{profile.display_name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {profile.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{profile.total_tokens} tokens</span>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex cursor-pointer items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  )
}
