"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { taskService } from "@/lib/services/task-service"
import { useGeolocation } from "@/hooks/use-geolocation"
import DashboardLayout from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUploader } from "@/components/ui/image-uploader"
import { Loader2, MapPin, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { TaskCategory, TaskSeverity } from "@/lib/types/database"

export default function PostTaskPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { location, error: geoError, loading: geoLoading } = useGeolocation()

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "garbage" as TaskCategory,
        severity: "medium" as TaskSeverity,
        imageUrl: "",
        rewardAmount: "100" // Default reward
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast.error("You must be logged in to post a task")
            return
        }

        if (!location) {
            toast.error("Location is required to post a task. Please enable GPS.")
            return
        }

        if (!formData.imageUrl) {
            toast.error("Please provide a photo of the issue")
            return
        }

        setLoading(true)
        try {
            await taskService.createTask({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                severity: formData.severity,
                image_url: formData.imageUrl,
                reward_amount: parseInt(formData.rewardAmount),
                posted_by: user.uid,
                status: "open",
                location_geo: `POINT(${location.longitude} ${location.latitude})`,
                // In a real app, we'd reverse geocode this to get address/city
                city: "Unknown",
                location_address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
            })

            toast.success("Task posted successfully!")
            router.push("/dashboard")
        } catch (error) {
            console.error("Post task error:", error)
            toast.error("Failed to post task")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout profile={{
            // Mock profile for layout if needed, ideally fetched or passed
            id: user?.uid || "",
            display_name: user?.displayName || "User",
            role: "citizen",
            total_tokens: 0,
            tasks_completed: 0
        } as any}>
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Report an Issue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Location Status */}
                            <div className="rounded-lg bg-muted p-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">Location Status</p>
                                        {geoLoading ? (
                                            <p className="text-sm text-muted-foreground">Acquiring GPS...</p>
                                        ) : location ? (
                                            <p className="text-sm text-green-600">
                                                Locked: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    (Accuracy: {location.accuracy.toFixed(0)}m)
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="text-sm text-destructive">
                                                {geoError || "Location unavailable. Please enable GPS."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Overflowing Dumpster at Market"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, category: val as TaskCategory }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="garbage">Garbage</SelectItem>
                                        <SelectItem value="pothole">Pothole</SelectItem>
                                        <SelectItem value="graffiti">Graffiti</SelectItem>
                                        <SelectItem value="drainage">Drainage</SelectItem>
                                        <SelectItem value="streetlight">Street Light</SelectItem>
                                        <SelectItem value="illegal_dump">Illegal Dump</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="severity">Severity</Label>
                                <Select
                                    value={formData.severity}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, severity: val as TaskSeverity }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low (Minor annoyance)</SelectItem>
                                        <SelectItem value="medium">Medium (Needs attention)</SelectItem>
                                        <SelectItem value="high">High (Health hazard)</SelectItem>
                                        <SelectItem value="critical">Critical (Immediate danger)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the issue in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Photo Evidence</Label>
                                <ImageUploader
                                    value={formData.imageUrl}
                                    onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                    path={`${user?.uid}/tasks`}
                                />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={loading || !location}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Post Task
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
