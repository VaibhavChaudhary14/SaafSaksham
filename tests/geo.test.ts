import { describe, it, expect } from 'vitest'
import { validateLocation } from '../lib/storage/upload'

// small helper to approximate nearby coordinates
function offsetLatLng(lat: number, lng: number, metersNorth: number, metersEast: number) {
  // approx conversions
  const dLat = metersNorth / 111320
  const dLng = metersEast / (111320 * Math.cos((lat * Math.PI) / 180))
  return { lat: lat + dLat, lng: lng + dLng }
}

describe('geo helpers', () => {
  it('calculate distance: zero distance', () => {
    const a = { latitude: 12.9715987, longitude: 77.594566 }
    const b = { latitude: 12.9715987, longitude: 77.594566 }
    const ok = validateLocation(a, b, 1)
    expect(ok).toBe(true)
  })

  it('validateLocation within range', () => {
    const origin = { latitude: 12.9715987, longitude: 77.594566 }
    const nearby = offsetLatLng(origin.latitude, origin.longitude, 50, 20)
    const ok = validateLocation({ latitude: nearby.lat, longitude: nearby.lng }, origin, 100)
    expect(ok).toBe(true)
  })

  it('validateLocation out of range', () => {
    const origin = { latitude: 12.9715987, longitude: 77.594566 }
    const far = offsetLatLng(origin.latitude, origin.longitude, 5000, 0)
    const ok = validateLocation({ latitude: far.lat, longitude: far.lng }, origin, 1000)
    expect(ok).toBe(false)
  })
})
