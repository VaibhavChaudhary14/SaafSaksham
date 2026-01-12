// Firebase client init (placeholder). Add the required env vars to `.env.local` and replace them before use.
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
}

let app: any = null

export function initFirebase() {
  if (!app) app = initializeApp(firebaseConfig)
  return app
}

export async function signInWithGooglePopup() {
  initFirebase()
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  const token = await result.user.getIdToken()
  return { user: result.user, token }
}
