"use client"

import type { Profile, Task } from "@/lib/types/database"
import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Target, CheckCircle2, Clock, Coins, TrendingUp, Activity, Plus, Eye, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminDashboardProps {
  profile: Profile
  stats: {
    totalUsers: number
    totalTasks: number
    completedTasks: number
    pendingVerifications: number
    tokensEarned: number
    tokensRedeemed: number
  }
  recentTasks: Task[]
  recentUsers: Profile[]
}

export default function AdminDashboard({ profile, stats, recentTasks, recentUsers }: AdminDashboardProps) {
  const router = useRouter()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create task form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    category: "garbage",
    severity: "medium",
    city: "Delhi",
    state: "Delhi",
    location_address: "",
    latitude: 0,
    longitude: 0,
    token_reward: 100,
    xp_reward: 50,
    estimated_time: 30,
  })

  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.description) {
      setError("Please fill in all required fields")
      return
    }

    setIsCreating(true)
    setError(null)
    const supabase = createClient()

    try {
      const { error: insertError } = await supabase.from("tasks").insert({
        ...taskForm,
        created_by: profile.id,
        status: "open",
        required_proof_types: ["before_photo", "after_photo"],
      })

      if (insertError) throw insertError

      setShowCreateTask(false)
      router.refresh()
    } catch (err) {
      console.error("[v0] Error creating task:", err)
      setError("Failed to create task. Please try again.")
    } finally {
      setIsCreating(false)
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

  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>
          <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-hover">
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task to the platform</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Clean public park"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Detailed task description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={taskForm.category}
                      onValueChange={(value) => setTaskForm({ ...taskForm, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="garbage">Garbage</SelectItem>
                        <SelectItem value="pothole">Pothole</SelectItem>
                        <SelectItem value="graffiti">Graffiti</SelectItem>
                        <SelectItem value="drainage">Drainage</SelectItem>
                        <SelectItem value="streetlight">Streetlight</SelectItem>
                        <SelectItem value="illegal_dump">Illegal Dump</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={taskForm.severity}
                      onValueChange={(value) => setTaskForm({ ...taskForm, severity: value })}
                    >
                      <SelectTrigger id="severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={taskForm.city}
                      onChange={(e) => setTaskForm({ ...taskForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={taskForm.state}
                      onChange={(e) => setTaskForm({ ...taskForm, state: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Location Address</Label>
                  <Input
                    id="address"
                    value={taskForm.location_address}
                    onChange={(e) => setTaskForm({ ...taskForm, location_address: e.target.value })}
                    placeholder="Connaught Place, New Delhi"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tokens">Token Reward</Label>
                    <Input
                      id="tokens"
                      type="number"
                      value={taskForm.token_reward}
                      onChange={(e) => setTaskForm({ ...taskForm, token_reward: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="xp">XP Reward</Label>
                    <Input
                      id="xp"
                      type="number"
                      value={taskForm.xp_reward}
                      onChange={(e) => setTaskForm({ ...taskForm, xp_reward: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Est. Time (min)</Label>
                    <Input
                      id="time"
                      type="number"
                      value={taskForm.estimated_time}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, estimated_time: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateTask(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">{completionRate.toFixed(1)}% completion rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Earned</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokensEarned.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Redeemed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokensRedeemed.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" onClick={() => router.push("/dashboard/verify")} className="justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Review Submissions ({stats.pendingVerifications})
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/admin/users")} className="justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/admin/tasks")} className="justify-start">
                <Target className="mr-2 h-4 w-4" />
                Manage Tasks
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/admin/analytics")}
                className="justify-start"
              >
                <Activity className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Recent Data */}
        <Tabs defaultValue="tasks">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">Recent Tasks</TabsTrigger>
            <TabsTrigger value="users">Recent Users</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-semibold">{task.title}</p>
                          <Badge variant="outline" className="capitalize">
                            {task.category.replace("_", " ")}
                          </Badge>
                          <Badge className={getSeverityColor(task.severity)}>{task.severity}</Badge>
                          <Badge
                            variant={
                              task.status === "open" ? "default" : task.status === "verified" ? "default" : "secondary"
                            }
                            className={task.status === "verified" ? "bg-green-500" : ""}
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {task.city}, {task.state} • {formatDate(task.created_at)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                            <span>
                              {user.city}, {user.state}
                            </span>
                            <span>• {formatDate(user.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <Coins className="h-4 w-4 text-primary" />
                          <span className="font-bold">{user.total_tokens}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{user.tasks_completed} tasks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
