"use client"

import type { Profile, Task, TaskProof } from "@/lib/types/database"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { verificationService } from "@/lib/services/verification-service"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import ProofGallery from "@/components/dashboard/proof-gallery"
import { MapPin, Coins, TrendingUp, Calendar, CheckCircle2, XCircle, AlertCircle, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VerifyTaskDetailProps {
  task: Task & { profiles?: Profile }
  proofs: TaskProof[]
  profile: Profile
}

export default function VerifyTaskDetail({ task, proofs, profile }: VerifyTaskDetailProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qualityScore, setQualityScore] = useState([7])
  const [cleanlinessScore, setCleanlinessScore] = useState([7])
  const [impactScore, setImpactScore] = useState([7])
  const [feedback, setFeedback] = useState("")

  const submitter = task.profiles

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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleVerify = async (approved: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      // Calculate overall score
      const overallScore = Math.round((qualityScore[0] + cleanlinessScore[0] + impactScore[0]) / 3)

      // Prepare verification data
      const verificationData = {
        task_id: task.id,
        verifier_id: profile.id,
        status: approved ? "approved" : "rejected" as any, // Cast to match type if needed
        quality_score: qualityScore[0],
        cleanliness_score: cleanlinessScore[0],
        impact_score: impactScore[0],
        overall_score: overallScore,
        feedback: feedback || null,
      }

      // Submit using service
      await verificationService.submitVerification(verificationData, task)

      router.push("/dashboard/verify")
    } catch (err) {
      console.error("[v0] Error verifying task:", err)
      setError("Failed to verify task. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back to Queue
        </Button>

        {/* Task Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-3xl">{getCategoryIcon(task.category)}</span>
                  <Badge variant="outline" className="capitalize">
                    {task.category.replace("_", " ")}
                  </Badge>
                  <Badge className={getSeverityColor(task.severity)}>{task.severity}</Badge>
                  <Badge variant="secondary">Pending Verification</Badge>
                </div>
                <CardTitle className="text-3xl">{task.title}</CardTitle>
              </div>
              <div className="text-right">
                <div className="mb-2 flex items-center justify-end gap-2 text-primary">
                  <Coins className="h-5 w-5" />
                  <span className="text-2xl font-bold">{task.token_reward}</span>
                </div>
                <div className="flex items-center justify-end gap-2 text-accent">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-lg font-bold">{task.xp_reward} XP</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">{task.description}</p>

            <Separator className="my-6" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{task.location_address || `${task.city}, ${task.state}`}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Submitted {formatDate(task.submitted_at || task.created_at)}</span>
              </div>
              {submitter && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>By {submitter.full_name}</span>
                  <Badge variant="secondary" className="capitalize">
                    {submitter.role}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submitted Proofs */}
        <Card>
          <CardHeader>
            <CardTitle>Submitted Proofs ({proofs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {proofs.length > 0 ? (
              <ProofGallery proofs={proofs} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No proofs submitted for this task.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Verification Scoring */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Scoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Quality Score: {qualityScore[0]}/10</Label>
              <Slider
                value={qualityScore}
                onValueChange={setQualityScore}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Rate the quality of proof provided (photos, videos, documentation)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cleanliness Score: {cleanlinessScore[0]}/10</Label>
              <Slider
                value={cleanlinessScore}
                onValueChange={setCleanlinessScore}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Rate the cleanliness achieved (before vs after comparison)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Impact Score: {impactScore[0]}/10</Label>
              <Slider value={impactScore} onValueChange={setImpactScore} max={10} min={1} step={1} className="w-full" />
              <p className="text-xs text-muted-foreground">Rate the overall community impact and effort involved</p>
            </div>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="text-3xl font-bold text-primary">
                {Math.round((qualityScore[0] + cleanlinessScore[0] + impactScore[0]) / 3)}/10
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Provide feedback to the contributor..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={() => handleVerify(true)}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isLoading ? "Processing..." : "Approve & Award Tokens"}
          </Button>
          <Button
            size="lg"
            variant="destructive"
            onClick={() => handleVerify(false)}
            disabled={isLoading}
            className="flex-1"
          >
            <XCircle className="mr-2 h-5 w-5" />
            {isLoading ? "Processing..." : "Reject Submission"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
