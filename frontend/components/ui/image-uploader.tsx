"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ImageUploaderProps {
    value?: string
    onChange: (url: string) => void
    disabled?: boolean
    bucket?: string
    path?: string // folder path inside bucket
}

export function ImageUploader({
    value,
    onChange,
    disabled,
    bucket = "task-proofs",
    path = "uploads"
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0]
            if (!file) return

            // Simple validation
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file")
                return
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("File size must be less than 5MB")
                return
            }

            setUploading(true)
            const supabase = createClient()

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
            const filePath = `${path}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            onChange(data.publicUrl)
            toast.success("Image uploaded successfully")
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Failed to upload image")
        } finally {
            setUploading(false)
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemove = () => {
        onChange("")
    }

    return (
        <div className="w-full">
            {value ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    <Image
                        src={value}
                        alt="Upload preview"
                        fill
                        className="object-cover"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
            relative flex aspect-video cursor-pointer flex-col items-center justify-center 
            rounded-lg border-2 border-dashed border-muted-foreground/25 
            bg-muted/50 transition-colors hover:bg-muted
            ${disabled ? "pointer-events-none opacity-60" : ""}
          `}
                >
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        disabled={disabled || uploading}
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-full bg-background p-3 shadow-sm">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">Click to upload photo</p>
                                <p className="text-xs text-muted-foreground">
                                    SVG, PNG, JPG or GIF (max 5MB)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
