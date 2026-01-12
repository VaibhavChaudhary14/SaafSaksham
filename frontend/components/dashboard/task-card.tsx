"use client"

import type { Task } from "@/lib/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Coins, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

interface TaskCardProps {
  task: Task
  getCategoryIcon: (category: string) => string
}

export default function TaskCard({ task, getCategoryIcon }: TaskCardProps) {
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
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(task.category)}</span>
            <Badge variant="outline" className="capitalize">
              {task.category.replace("_", " ")}
            </Badge>
          </div>
          <Badge className={getSeverityColor(task.severity)}>{task.severity}</Badge>
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground group-hover:text-primary">
          {task.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{task.location_address || `${task.city}, ${task.state}`}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Posted {formatDate(task.created_at)}</span>
          </div>
          {task.estimated_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{task.estimated_time} minutes</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-primary">
              <Coins className="h-4 w-4" />
              <span className="font-bold">{task.token_reward}</span>
              <span className="text-xs text-muted-foreground">tokens</span>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <TrendingUp className="h-4 w-4" />
              <span className="font-bold">{task.xp_reward}</span>
              <span className="text-xs text-muted-foreground">XP</span>
            </div>
          </div>
          <Link href={`/dashboard/tasks/${task.id}`}>
            <Button size="sm" className="bg-primary hover:bg-primary-hover">
              View Task
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
