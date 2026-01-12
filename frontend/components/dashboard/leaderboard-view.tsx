"use client"

import React from "react"
import type { Profile, LeaderboardEntry } from "@/lib/types/database"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Coins, TrendingUp, Flame, Target, Crown } from "lucide-react"

interface LeaderboardViewProps {
  profile: Profile
  leaderboardData: LeaderboardEntry[]
  userRanking: LeaderboardEntry | null
}

export default function LeaderboardView({ profile, leaderboardData, userRanking }: LeaderboardViewProps) {
  const [sortBy, setSortBy] = useState<"tokens" | "xp" | "tasks" | "streak">("tokens")

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
          <Crown className="h-6 w-6 text-yellow-600" />
        </div>
      )
    if (rank === 2)
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Medal className="h-6 w-6 text-gray-500" />
        </div>
      )
    if (rank === 3)
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
          <Trophy className="h-6 w-6 text-orange-600" />
        </div>
      )
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">{rank}</div>
    )
  }

  const sortedData = [...leaderboardData].sort((a, b) => {
    switch (sortBy) {
      case "tokens":
        return b.total_tokens - a.total_tokens
      case "xp":
        return b.total_xp - a.total_xp
      case "tasks":
        return b.tasks_completed - a.tasks_completed
      case "streak":
        return b.current_streak - a.current_streak
      default:
        return a.global_rank - b.global_rank
    }
  })

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Compete with other civic champions</p>
        </div>

        {/* User's Ranking Card */}
        {userRanking && (
          <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getRankBadge(userRanking.global_rank)}
                  <div>
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className="text-2xl font-bold">#{userRanking.global_rank}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Coins className="h-4 w-4" />
                      <span className="text-xl font-bold">{userRanking.total_tokens.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Tokens</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-accent">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xl font-bold">{userRanking.total_xp.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Target className="h-4 w-4" />
                      <span className="text-xl font-bold">{userRanking.tasks_completed}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-orange-500">
                      <Flame className="h-4 w-4" />
                      <span className="text-xl font-bold">{userRanking.current_streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Streak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sort Tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tokens">
                  <Coins className="mr-2 h-4 w-4" />
                  Tokens
                </TabsTrigger>
                <TabsTrigger value="xp">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  XP
                </TabsTrigger>
                <TabsTrigger value="tasks">
                  <Target className="mr-2 h-4 w-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="streak">
                  <Flame className="mr-2 h-4 w-4" />
                  Streak
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Leaderboard List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedData.map((entry, index) => {
                const actualRank = index + 1
                const isCurrentUser = entry.user_id === profile.id
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between rounded-lg p-4 transition-colors ${isCurrentUser ? "bg-primary/10 border-2 border-primary" : "border hover:bg-muted/50"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      {getRankBadge(actualRank)}
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={entry.avatar_url || ""} />
                        <AvatarFallback>{entry.display_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {entry.display_name || "Unknown User"}
                            {isCurrentUser && <Badge variant="secondary">You</Badge>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {entry.city && (
                            <span>
                              {entry.city}, {entry.state}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                      <div>
                        <div className="flex items-center gap-1 text-primary">
                          <Coins className="h-4 w-4" />
                          <span className="font-bold">{entry.total_tokens.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Tokens</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-accent">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-bold">{entry.total_xp.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span className="font-bold">{entry.tasks_completed}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Tasks</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame className="h-4 w-4" />
                          <span className="font-bold">{entry.current_streak}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Streak</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
