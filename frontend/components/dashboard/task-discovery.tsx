"use client"

import type { Profile, Task, TaskCategory } from "@/lib/types/database"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard/layout"
import TaskMap from "@/components/dashboard/task-map"
import TaskCard from "@/components/dashboard/task-card"
import Link from "next/link"
import { useGeolocation } from "@/hooks/use-geolocation"
import { MapPin, Search, Coins, TrendingUp, Award, Zap, LayoutGrid, MapIcon, SlidersHorizontal, Navigation, PlusCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { taskService, type TaskFilters } from "@/lib/services/task-service"

interface TaskDiscoveryProps {
  profile: Profile
}

export default function TaskDiscovery({ profile }: TaskDiscoveryProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("nearest") // Default to nearest
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const { location, error: geoError } = useGeolocation()

  // Real database fetch
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const filters: TaskFilters = {
          status: "open"
        }

        if (categoryFilter !== "all") {
          filters.category = [categoryFilter as TaskCategory]
        }

        // If "Nearest" is selected and we have location, use the geospatial query
        if (sortBy === "nearest" && location) {
          filters.nearby = {
            lat: location.latitude,
            lng: location.longitude,
            radius: 25000 // 25km radius
          }
        }

        const fetchedTasks = await taskService.getTasks(filters)
        setTasks(fetchedTasks)
      } catch (error) {
        console.error("Failed to load tasks", JSON.stringify(error, null, 2))
      } finally {
        setLoading(false)
      }
    }

    // Debounce effects if needed, but for now simple dependency tracking
    fetchTasks()
  }, [categoryFilter, sortBy, location]) // Refetch when location becomes available or sort changes

  // Client-side filtering and sorting
  const getFilteredAndSortedTasks = () => {
    let result = [...tasks]

    // Search
    if (searchQuery) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.city.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Severity
    if (severityFilter !== "all") {
      result = result.filter((task) => task.severity === severityFilter)
    }

    // Sorting
    switch (sortBy) {
      case "reward_high":
        result.sort((a, b) => b.token_reward - a.token_reward)
        break
      case "reward_low":
        result.sort((a, b) => a.token_reward - b.token_reward)
        break
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "severity":
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        // @ts-ignore
        result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
        break
    }

    return result
  }

  const filteredTasks = getFilteredAndSortedTasks()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "garbage": return "🗑️"
      case "pothole": return "🕳️"
      case "graffiti": return "🎨"
      case "drainage": return "💧"
      case "streetlight": return "💡"
      case "illegal_dump": return "⚠️"
      default: return "📍"
    }
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        {/* Header Stats - Keeping these static or connected to profile for now */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold">{profile.total_tokens}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{profile.current_streak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-1/10">
                  <Award className="h-6 w-6 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold">{profile.tasks_completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                  <Zap className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-bold">{profile.total_xp}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks by title, description, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "map")}>
                  <TabsList>
                    <TabsTrigger value="grid" className="gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Grid
                    </TabsTrigger>
                    <TabsTrigger value="map" className="gap-2">
                      <MapIcon className="h-4 w-4" />
                      Map
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {showFilters && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="garbage">Garbage</SelectItem>
                        <SelectItem value="pothole">Pothole</SelectItem>
                        <SelectItem value="graffiti">Graffiti</SelectItem>
                        <SelectItem value="drainage">Drainage</SelectItem>
                        <SelectItem value="streetlight">Street Light</SelectItem>
                        <SelectItem value="illegal_dump">Illegal Dump</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Severity</label>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger>
                        <SelectValue />
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
                  <div>
                    <label className="mb-2 block text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nearest">Nearest to Me</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="reward_high">Highest Reward</SelectItem>
                        <SelectItem value="reward_low">Lowest Reward</SelectItem>
                        <SelectItem value="severity">By Severity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Display */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Available Tasks <span className="text-muted-foreground">({filteredTasks.length})</span>
            </h2>
            <Link href="/dashboard/post-task">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-40 rounded-lg bg-muted"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} getCategoryIcon={getCategoryIcon} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No tasks found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                </div>
              )}
            </div>
          ) : (
            <TaskMap tasks={filteredTasks} getCategoryIcon={getCategoryIcon} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
