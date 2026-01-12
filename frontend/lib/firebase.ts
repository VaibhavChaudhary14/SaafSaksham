import { initializeApp, getApps } from 'firebase/app'
import {
    getAuth,
    GoogleAuthProvider,
    connectAuthEmulator
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

import { getStorage } from 'firebase/storage'

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const storage = getStorage(app)

// Google OAuth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
    prompt: 'select_account', // Force account selection
})

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Uncomment to use Firebase emulator
    // connectAuthEmulator(auth, 'http://localhost:9099')
}

export { auth, googleProvider, storage }
export default app
