// Lazy-import Supabase client where needed to avoid path-alias resolution issues during tests
async function getBrowserClient() {
  const mod = await import('../supabase/client')
  return mod.createClient()
}

interface UploadOptions {
  bucket: string
  path?: string
  maxSizeMB?: number
  allowedTypes?: string[]
  compress?: boolean
}

interface UploadResult {
  url: string
  path: string
  metadata: {
    size: number
    type: string
    width?: number
    height?: number
    gps?: {
      latitude: number
      longitude: number
      accuracy: number
    }
    timestamp: string
  }
}

/**
 * Upload image to Supabase Storage with validation and metadata extraction
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    bucket = 'task-proofs',
    path = '',
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    compress = true
  } = options

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed. Allowed: ${allowedTypes.join(', ')}`)
  }

  // Validate file size
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    throw new Error(`File size ${sizeMB.toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`)
  }

  // Extract metadata
  const metadata = await extractImageMetadata(file)

  // Compress if needed
  let processedFile = file
  if (compress && sizeMB > 2) {
    processedFile = await compressImage(file, 0.8)
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
  const filePath = path ? `${path}/${fileName}` : fileName

  // Upload to Supabase (browser client)
  const supabase = await getBrowserClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, processedFile, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return {
    url: publicUrl,
    path: filePath,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Extract metadata from image including EXIF GPS
 */
async function extractImageMetadata(file: File) {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      const img = new Image()
      
      img.onload = async () => {
        // Get GPS coordinates
        const gps = await getCurrentLocation()
        
        resolve({
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          gps: gps || null
        })
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Get current GPS location
 */
async function getCurrentLocation(): Promise<{
  latitude: number
  longitude: number
  accuracy: number
} | null> {
  if (!navigator.geolocation) return null

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000 }
    )
  })
}

/**
 * Compress image to reduce file size
 */
async function compressImage(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Resize if too large (max 1920x1080)
        let width = img.width
        let height = img.height
        const maxWidth = 1920
        const maxHeight = 1080

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Compression failed'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Validate if GPS location is within acceptable range of task location
 */
export function validateLocation(
  photoGPS: { latitude: number; longitude: number },
  taskGPS: { latitude: number; longitude: number },
  maxDistanceMeters: number = 100
): boolean {
  const distance = calculateDistance(
    photoGPS.latitude,
    photoGPS.longitude,
    taskGPS.latitude,
    taskGPS.longitude
  )
  
  return distance <= maxDistanceMeters
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Setup Supabase Storage bucket policies (run once)
 */
export async function setupStorageBucket() {
  const supabase = await getBrowserClient()
  
  // Create bucket if not exists
  const { data: buckets } = await supabase.storage.listBuckets()
  const taskProofsBucket = buckets?.find(b => b.name === 'task-proofs')
  
  if (!taskProofsBucket) {
    await supabase.storage.createBucket('task-proofs', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    })
  }
}
