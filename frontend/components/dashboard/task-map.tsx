"use client"

import type { Task } from "@/lib/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface TaskMapProps {
  tasks: Task[]
  getCategoryIcon: (category: string) => string
}

export default function TaskMap({ tasks, getCategoryIcon }: TaskMapProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-[600px] w-full bg-muted/50">
          {/* Placeholder for map - In production, use Google Maps or Mapbox */}
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Interactive Map Coming Soon</h3>
              <p className="text-sm text-muted-foreground">Geotagged tasks will be displayed on an interactive map</p>
              <div className="mt-4 text-xs text-muted-foreground">{tasks.length} tasks in your area</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
