import React from 'react'

export interface ImageUploadProps {
  onChange?: (file: File) => void
}

export default function ImageUpload({ onChange }: ImageUploadProps) {
  return (
    <div>
      <label style={{display: 'block', marginBottom: 8}}>Upload image (placeholder)</label>
      <input type="file" accept="image/*" onChange={(e) => e.target.files && onChange?.(e.target.files[0])} />
      <p style={{fontSize: 12}}>TODO: add preview, progress, and validation</p>
    </div>
  )
}
