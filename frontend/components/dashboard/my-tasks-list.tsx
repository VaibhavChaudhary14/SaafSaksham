"use client"

import type { Task } from "@/lib/types/database"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import TaskCard from "@/components/dashboard/task-card"
import { Clock, CheckCircle2, XCircle, Hourglass } from "lucide-react"

interface MyTasksListProps {
  tasks: Task[]
}

export default function MyTasksList({ tasks }: MyTasksListProps) {
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

  const claimedTasks = tasks.filter((t) => t.status === "claimed")
  const submittedTasks = tasks.filter((t) => t.status === "submitted")
  const verifiedTasks = tasks.filter((t) => t.status === "verified")
  const rejectedTasks = tasks.filter((t) => t.status === "rejected")

  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">Track and manage your claimed tasks</p>
      </div>

      <Tabs defaultValue="claimed" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="claimed" className="gap-2">
            <Hourglass className="h-4 w-4" />
            In Progress ({claimedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="submitted" className="gap-2">
            <Clock className="h-4 w-4" />
            Submitted ({submittedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="verified" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Verified ({verifiedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claimed" className="mt-6">
          {claimedTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {claimedTasks.map((task) => (
                <TaskCard key={task.id} task={task} getCategoryIcon={getCategoryIcon} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Hourglass}
              title="No tasks in progress"
              description="Claim a task from the discovery page to get started"
            />
          )}
        </TabsContent>

        <TabsContent value="submitted" className="mt-6">
          {submittedTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {submittedTasks.map((task) => (
                <TaskCard key={task.id} task={task} getCategoryIcon={getCategoryIcon} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No submitted tasks"
              description="Complete and submit your claimed tasks for verification"
            />
          )}
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          {verifiedTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {verifiedTasks.map((task) => (
                <TaskCard key={task.id} task={task} getCategoryIcon={getCategoryIcon} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No verified tasks yet"
              description="Your verified tasks will appear here once approved"
            />
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedTasks.map((task) => (
                <TaskCard key={task.id} task={task} getCategoryIcon={getCategoryIcon} />
              ))}
            </div>
          ) : (
            <EmptyState icon={XCircle} title="No rejected tasks" description="Keep up the good work!" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
