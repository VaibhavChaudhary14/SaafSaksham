"use client"

import type { Profile, Task } from "@/lib/types/database"
import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Coins, TrendingUp, Search, Filter } from "lucide-react"

interface VerificationQueueProps {
  tasks: Task[]
  profile: Profile
}

export default function VerificationQueue({ tasks: initialTasks, profile }: VerificationQueueProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "garbage":
        return "🗑️"
      case "pothole":
        return "🕳️"
      case "graffiti":
        return "🎨"
      case "drainage":
        return "💧"
      case "streetlight":
        return "💡"
      case "illegal_dump":
        return "⚠️"
      default:
        return "📍"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filter tasks
  const filteredTasks = initialTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter
    const matchesSeverity = severityFilter === "all" || task.severity === severityFilter
    return matchesSearch && matchesCategory && matchesSeverity
  })

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verification Queue</h1>
          <p className="text-muted-foreground">Review and verify submitted task completions</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredTasks.reduce((sum, task) => sum + task.token_reward, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTasks.reduce((sum, task) => sum + task.xp_reward, 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="garbage">Garbage</SelectItem>
                  <SelectItem value="pothole">Pothole</SelectItem>
                  <SelectItem value="graffiti">Graffiti</SelectItem>
                  <SelectItem value="drainage">Drainage</SelectItem>
                  <SelectItem value="streetlight">Streetlight</SelectItem>
                  <SelectItem value="illegal_dump">Illegal Dump</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center p-6">
              <div className="text-center">
                <Filter className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-semibold">No tasks to verify</p>
                <p className="text-sm text-muted-foreground">All caught up! Check back later for new submissions.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                        <Badge variant="outline" className="capitalize">
                          {task.category.replace("_", " ")}
                        </Badge>
                        <Badge className={getSeverityColor(task.severity)}>{task.severity}</Badge>
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{task.title}</h3>
                      <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {task.city}, {task.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Submitted {formatDate(task.submitted_at || task.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:items-end">
                      <div className="flex items-center gap-2 text-primary">
                        <Coins className="h-5 w-5" />
                        <span className="text-xl font-bold">{task.token_reward}</span>
                      </div>
                      <div className="flex items-center gap-2 text-accent">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-bold">{task.xp_reward} XP</span>
                      </div>
                      <Button onClick={() => router.push(`/dashboard/verify/${task.id}`)} className="mt-2">
                        Review Task
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
