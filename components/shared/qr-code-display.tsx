import React from 'react'

export default function QrCodeDisplay({ payload }: { payload?: string }) {
  return (
    <div>
      <h3>QR Code (placeholder)</h3>
      <pre style={{background: '#f6f6f6', padding: 8}}>{payload ?? 'no payload'}</pre>
      <p style={{fontSize: 12}}>TODO: render actual SVG/Canvas QR with `qrcode` library</p>
    </div>
  )
}
