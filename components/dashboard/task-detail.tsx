"use client"

import type { Profile, Task, TaskProof } from "@/lib/types/database"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ProofUpload from "@/components/dashboard/proof-upload"
import ProofGallery from "@/components/dashboard/proof-gallery"
import { MapPin, Clock, Coins, TrendingUp, Calendar, AlertCircle, CheckCircle2, Upload, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TaskDetailProps {
  task: Task
  profile: Profile
  proofs: TaskProof[]
}

export default function TaskDetail({ task, profile, proofs: initialProofs }: TaskDetailProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proofs, setProofs] = useState<TaskProof[]>(initialProofs)
  const [showProofUpload, setShowProofUpload] = useState(false)

  const isClaimed = task.claimed_by === profile.id
  const isSubmitted = task.status === "submitted"
  const isVerified = task.status === "verified"
  const isRejected = task.status === "rejected"

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

  const handleClaimTask = async () => {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "claimed",
          claimed_by: profile.id,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", task.id)
        .eq("status", "open")

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error("[v0] Error claiming task:", err)
      setError("Failed to claim task. It may have been claimed by someone else.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitTask = async () => {
    // Check if required proofs are uploaded
    const requiredProofTypes = task.required_proof_types || ["before_photo", "after_photo"]
    const uploadedProofTypes = proofs.map((p) => p.proof_type)
    const missingProofs = requiredProofTypes.filter((type) => !uploadedProofTypes.includes(type))

    if (missingProofs.length > 0) {
      setError(`Missing required proofs: ${missingProofs.join(", ")}. Please upload all required proof types.`)
      return
    }

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", task.id)
        .eq("claimed_by", profile.id)

      if (error) throw error
      router.push("/dashboard/my-tasks")
    } catch (err) {
      console.error("[v0] Error submitting task:", err)
      setError("Failed to submit task. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProofUploaded = (newProof: TaskProof) => {
    setProofs([...proofs, newProof])
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back to Tasks
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
                  <Badge
                    variant={
                      task.status === "open"
                        ? "default"
                        : task.status === "verified"
                          ? "default"
                          : task.status === "rejected"
                            ? "destructive"
                            : "secondary"
                    }
                    className={task.status === "verified" ? "bg-green-500" : ""}
                  >
                    {task.status}
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{task.title}</CardTitle>
              </div>
              <div className="text-right">
                <div className="mb-2 flex items-center justify-end gap-2 text-primary">
                  <Coins className="h-5 w-5" />
                  <span className="text-2xl font-bold">{task.token_reward}</span>
                  <span className="text-sm text-muted-foreground">tokens</span>
                </div>
                <div className="flex items-center justify-end gap-2 text-accent">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-lg font-bold">{task.xp_reward}</span>
                  <span className="text-xs text-muted-foreground">XP</span>
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
                <span>Posted {formatDate(task.created_at)}</span>
              </div>
              {task.estimated_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Estimated time: {task.estimated_time} minutes</span>
                </div>
              )}
              {task.expires_at && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Expires: {formatDate(task.expires_at)}</span>
                </div>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Required Proofs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Required Proof
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {task.required_proof_types.map((type) => (
                <Badge key={type} variant="outline" className="capitalize">
                  {type.replace("_", " ")}
                </Badge>
              ))}
            </div>
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
        {!isClaimed && task.status === "open" && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <h3 className="text-lg font-semibold">Ready to make an impact?</h3>
                <p className="text-sm text-muted-foreground">
                  Claim this task to start working on it. You'll need to upload proof once completed.
                </p>
                <Button
                  size="lg"
                  onClick={handleClaimTask}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary-hover"
                >
                  {isLoading ? "Claiming..." : "Claim This Task"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proof Upload Section */}
        {isClaimed && !isSubmitted && !isVerified && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Proof
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Upload before and after photos with timestamps. Make sure your photos are clear and show the task
                      area.
                    </AlertDescription>
                  </Alert>
                </div>
                {showProofUpload ? (
                  <ProofUpload
                    taskId={task.id}
                    userId={profile.id}
                    onProofUploaded={handleProofUploaded}
                    onCancel={() => setShowProofUpload(false)}
                  />
                ) : (
                  <Button onClick={() => setShowProofUpload(true)} variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Add Proof
                  </Button>
                )}
              </CardContent>
            </Card>

            {proofs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Proofs ({proofs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProofGallery proofs={proofs} />
                  <Separator className="my-6" />
                  <Button
                    onClick={handleSubmitTask}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-hover"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isLoading ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Submitted Status */}
        {isSubmitted && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">Task Submitted for Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Your task has been submitted and is being reviewed by our verifiers. You'll be notified once it's
                  verified.
                </p>
                {proofs.length > 0 && <ProofGallery proofs={proofs} />}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verified Status */}
        {isVerified && (
          <Card className="border-green-500">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-600">Task Verified!</h3>
                <p className="text-sm text-muted-foreground">
                  Congratulations! Your task has been verified. Tokens and XP have been added to your account.
                </p>
                {proofs.length > 0 && <ProofGallery proofs={proofs} />}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejected Status */}
        {isRejected && (
          <Card className="border-red-500">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-600">Task Rejected</h3>
                <p className="text-sm text-muted-foreground">
                  Your task submission did not meet the verification criteria. Please review the feedback and try again.
                </p>
                {proofs.length > 0 && <ProofGallery proofs={proofs} />}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
