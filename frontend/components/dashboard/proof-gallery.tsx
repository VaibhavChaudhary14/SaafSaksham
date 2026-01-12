"use client"

import type { TaskProof } from "@/lib/types/database"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface ProofGalleryProps {
  proofs: TaskProof[]
}

export default function ProofGallery({ proofs }: ProofGalleryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {proofs.map((proof) => (
        <div key={proof.id} className="overflow-hidden rounded-lg border">
          <div className="relative aspect-video bg-muted">
            <Image
              src={proof.media_url || "/placeholder.svg"}
              alt={proof.caption || proof.proof_type}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="secondary" className="capitalize">
                {proof.proof_type.replace("_", " ")}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatDate(proof.created_at)}</span>
            </div>
            {proof.caption && <p className="text-sm text-muted-foreground">{proof.caption}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
