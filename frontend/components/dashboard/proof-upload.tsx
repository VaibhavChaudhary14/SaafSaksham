"use client"

import type React from "react"

import type { TaskProof, ProofType } from "@/lib/types/database"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2 } from "lucide-react"

interface ProofUploadProps {
  taskId: string
  userId: string
  onProofUploaded: (proof: TaskProof) => void
  onCancel: () => void
}

export default function ProofUpload({ taskId, userId, onProofUploaded, onCancel }: ProofUploadProps) {
  const [proofType, setProofType] = useState<ProofType>("before_photo")
  const [caption, setCaption] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Upload to Supabase Storage (simulated - in production would use actual storage)
      // For now, we'll use a placeholder URL
      const fileName = `${taskId}/${userId}/${Date.now()}_${file.name}`
      const mediaUrl = `/placeholder.svg?height=400&width=600&query=${proofType}`

      // In production, uncomment this:
      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from('task-proofs')
      //   .upload(fileName, file)
      // if (uploadError) throw uploadError

      // Create proof record
      const proofData = {
        task_id: taskId,
        user_id: userId,
        proof_type: proofType,
        media_url: mediaUrl,
        media_type: file.type.startsWith("video") ? "video" : "image",
        caption: caption || null,
        metadata: {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        },
      }

      const { data: newProof, error: insertError } = await supabase
        .from("task_proofs")
        .insert(proofData)
        .select()
        .single()

      if (insertError) throw insertError

      onProofUploaded(newProof as TaskProof)
      setFile(null)
      setCaption("")
      onCancel()
    } catch (err) {
      console.error("[v0] Error uploading proof:", err)
      setError("Failed to upload proof. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="proof-type">Proof Type</Label>
        <Select value={proofType} onValueChange={(value: ProofType) => setProofType(value)}>
          <SelectTrigger id="proof-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="before_photo">Before Photo</SelectItem>
            <SelectItem value="after_photo">After Photo</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="additional">Additional Proof</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="file-upload">Upload File</Label>
        <div className="mt-2">
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50"
          >
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {file ? file.name : "Click to upload or drag and drop"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">PNG, JPG, or MP4 (max 10MB)</span>
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*,video/mp4"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="caption">Caption (Optional)</Label>
        <Textarea
          id="caption"
          placeholder="Add a description of your proof..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={handleUpload} disabled={isUploading || !file} className="flex-1">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Proof
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
