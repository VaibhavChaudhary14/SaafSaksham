
import { useState, useEffect } from 'react'

interface Location {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: number
}

interface GeolocationError {
    code: number
    message: string
}

export function useGeolocation() {
    const [location, setLocation] = useState<Location | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            setLoading(false)
            return
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

        const success = (position: GeolocationPosition) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
            })
            setError(null)
            setLoading(false)
        }

        const handleError = (error: GeolocationPositionError) => {
            setError(error.message)
            setLoading(false)
        }

        const watcher = navigator.geolocation.watchPosition(success, handleError, options)

        return () => navigator.geolocation.clearWatch(watcher)
    }, [])

    return { location, error, loading }
}
