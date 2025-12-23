"use client"

import React from "react"
import type { Profile, Badge as BadgeType, UserBadge } from "@/lib/types/database"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Lock, CheckCircle2, Star, Trophy, Sparkles, Crown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BadgesViewProps {
  profile: Profile
  allBadges: BadgeType[]
  userBadges: UserBadge[]
}

export default function BadgesView({ profile, allBadges, userBadges }: BadgesViewProps) {
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id))

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "epic":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "common":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return <Crown className="h-5 w-5" />
      case "epic":
        return <Sparkles className="h-5 w-5" />
      case "rare":
        return <Star className="h-5 w-5" />
      case "common":
        return <Award className="h-5 w-5" />
      default:
        return <Trophy className="h-5 w-5" />
    }
  }

  // Helper to extract required count from JSONB criteria
  const getRequiredCount = (badge: BadgeType): number => {
    if (!badge.criteria) return 0
    // Check for common criteria keys
    if (typeof badge.criteria.tasks_completed === "number") return badge.criteria.tasks_completed
    if (typeof badge.criteria.current_streak === "number") return badge.criteria.current_streak
    // Fallback or other criteria
    return 100 // Default denominator to avoid division by zero
  }

  const getProgressValue = (badge: BadgeType) => {
    const required = getRequiredCount(badge)
    if (required === 0) return 0

    if (badge.category === "streak" || badge.criteria.current_streak) {
      return Math.min((profile.current_streak / required) * 100, 100)
    }
    // Default to task completion for "milestone" or others
    return Math.min((profile.tasks_completed / required) * 100, 100)
  }

  const getProgressLabel = (badge: BadgeType) => {
    const required = getRequiredCount(badge)
    if (badge.category === "streak" || badge.criteria.current_streak) {
      return `${required} day streak`
    }
    return `${required} tasks`
  }

  const getCategoryProgress = (category: string) => {
    const categoryBadges = allBadges.filter((b) => b.category === category)
    if (categoryBadges.length === 0) return 0
    const earnedCount = categoryBadges.filter((b) => earnedBadgeIds.has(b.id)).length
    return (earnedCount / categoryBadges.length) * 100
  }

  const earnedBadges = allBadges.filter((badge) => earnedBadgeIds.has(badge.id))
  const lockedBadges = allBadges.filter((badge) => !earnedBadgeIds.has(badge.id))

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Badges & Achievements</h1>
          <p className="text-muted-foreground">Unlock badges by completing tasks and reaching milestones</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {earnedBadges.length}/{allBadges.length}
              </div>
              <Progress value={allBadges.length > 0 ? (earnedBadges.length / allBadges.length) * 100 : 0} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Task Master</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.tasks_completed}</div>
              <Progress value={getCategoryProgress("milestone")} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.total_xp.toLocaleString()}</div>
              <Progress value={getCategoryProgress("impact")} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.current_streak} days</div>
              <Progress value={getCategoryProgress("streak")} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Badge Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Badges ({allBadges.length})</TabsTrigger>
            <TabsTrigger value="earned">Earned ({earnedBadges.length})</TabsTrigger>
            <TabsTrigger value="locked">Locked ({lockedBadges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allBadges.map((badge) => {
                const isEarned = earnedBadgeIds.has(badge.id)
                const userBadge = userBadges.find((ub) => ub.badge_id === badge.id)
                return (
                  <Card
                    key={badge.id}
                    className={`relative transition-all ${isEarned ? "border-2 border-primary shadow-lg" : "opacity-75"}`}
                  >
                    {isEarned && (
                      <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="mb-4 flex items-center justify-center">
                        <div
                          className={`flex h-20 w-20 items-center justify-center rounded-full ${isEarned ? getRarityColor(badge.rarity) : "bg-muted"}`}
                        >
                          {isEarned ? (
                            <span className="text-4xl">{badge.icon_url || "🏆"}</span>
                          ) : (
                            <Lock className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-center text-xl">{badge.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-center text-sm text-muted-foreground">{badge.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge className={getRarityColor(badge.rarity)} variant="secondary">
                          {getRarityIcon(badge.rarity)}
                          <span className="ml-1 capitalize">{badge.rarity}</span>
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {badge.category.replace("_", " ")}
                        </Badge>
                      </div>
                      {!isEarned && (
                        <div className="rounded-lg bg-muted p-3 text-center">
                          <p className="text-xs text-muted-foreground">
                            Complete {getProgressLabel(badge)}
                          </p>
                          <Progress
                            value={getProgressValue(badge)}
                            className="mt-2"
                          />
                        </div>
                      )}
                      {isEarned && userBadge && (
                        <div className="rounded-lg bg-green-50 p-3 text-center">
                          <p className="text-xs text-green-700">
                            Earned on {new Date(userBadge.earned_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-4 text-xs">
                        <span className="text-primary">+{badge.reward_tokens} tokens</span>
                        <span className="text-accent">+{badge.reward_xp} XP</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="earned" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {earnedBadges.map((badge) => {
                const userBadge = userBadges.find((ub) => ub.badge_id === badge.id)
                return (
                  <Card key={badge.id} className="relative border-2 border-primary shadow-lg">
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <CardHeader>
                      <div className="mb-4 flex items-center justify-center">
                        <div
                          className={`flex h-20 w-20 items-center justify-center rounded-full ${getRarityColor(badge.rarity)}`}
                        >
                          <span className="text-4xl">{badge.icon_url || "🏆"}</span>
                        </div>
                      </div>
                      <CardTitle className="text-center text-xl">{badge.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-center text-sm text-muted-foreground">{badge.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge className={getRarityColor(badge.rarity)} variant="secondary">
                          {getRarityIcon(badge.rarity)}
                          <span className="ml-1 capitalize">{badge.rarity}</span>
                        </Badge>
                      </div>
                      {userBadge && (
                        <div className="rounded-lg bg-green-50 p-3 text-center">
                          <p className="text-xs text-green-700">
                            Earned on {new Date(userBadge.earned_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="locked" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lockedBadges.map((badge) => (
                <Card key={badge.id} className="opacity-75">
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-center text-xl">{badge.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-center text-sm text-muted-foreground">{badge.description}</p>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        Complete {getProgressLabel(badge)}
                      </p>
                      <Progress
                        value={getProgressValue(badge)}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
