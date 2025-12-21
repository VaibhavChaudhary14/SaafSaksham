import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/serverService'

// This endpoint accepts multipart/form-data with fields:
// - file (File) optional: file to upload
// - metadata (JSON) optional: metadata extracted client-side (width/height/gps)
// If `file` is present it will be uploaded to Supabase Storage using the service role key.

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // Support JSON body with { path, metadata }
    if (contentType.includes('application/json')) {
      const body = await req.json()
      // If `path` is provided, just return the path and metadata
      if (!body.path) return NextResponse.json({ ok: false, message: 'path is required in JSON upload' }, { status: 400 })
      return NextResponse.json({ ok: true, url: body.path, metadata: body.metadata ?? null })
    }

    // Support multipart/form-data upload
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file') as File | null
      const metadata = form.get('metadata') ? JSON.parse(form.get('metadata') as string) : null
      const bucket = (form.get('bucket') as string) || 'task-proofs'
      const pathPrefix = (form.get('path') as string) || ''

      if (!file) return NextResponse.json({ ok: false, message: 'file is required' }, { status: 400 })

      // Generate unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`
      const filePath = pathPrefix ? `${pathPrefix}/${fileName}` : fileName

      const supabase = createServiceClient()

      // Convert file to ArrayBuffer then Buffer for upload
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false
      })

      if (error) {
        console.error('Supabase upload error', error)
        throw error
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return NextResponse.json({ ok: true, url: urlData.publicUrl, path: filePath, metadata })
    }

    return NextResponse.json({ ok: false, message: 'Unsupported content type' }, { status: 415 })
  } catch (err: any) {
    console.error('upload route error', err)
    return NextResponse.json({ ok: false, message: err.message ?? 'unknown error' }, { status: 500 })
  }
}
