import { boot } from 'quasar/wrappers'
import { getApps, initializeApp } from 'firebase/app'
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId']
const missingKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key])

if (missingKeys.length) {
  console.warn(
    `[firebase] Missing configuration for: ${missingKeys.join(', ')}. Check your environment variables.`
  )
}

// Initialize Firebase
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

// Initialize Functions with explicit region
const functions = getFunctions(firebaseApp, 'us-central1')

console.log('[firebase] Initialized:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  functionsRegion: 'us-central1'
})

export { firebaseApp, auth, db, functions }

export default boot(async () => {
  if (typeof window === 'undefined') {
    return
  }

  await setPersistence(auth, browserLocalPersistence)

  // Auth Emulator
  const shouldUseAuthEmulator = process.env.FIREBASE_USE_AUTH_EMULATOR === 'true'
  if (shouldUseAuthEmulator) {
    const host = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'
    const emulatorUrl = host.startsWith('http') ? host : `http://${host}`
    connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true })
    console.log('[firebase] Using Auth emulator:', emulatorUrl)
  }

  // Functions Emulator (checking both VITE_ and FIREBASE_ prefixes)
  const shouldUseFunctionsEmulator = 
    process.env.VITE_USE_FUNCTIONS_EMULATOR === 'true' || 
    process.env.FIREBASE_USE_FUNCTIONS_EMULATOR === 'true'
  
  if (shouldUseFunctionsEmulator) {
    const host = process.env.VITE_FUNCTIONS_EMULATOR_HOST || 
                 process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST || 
                 'localhost'
    const port = parseInt(process.env.VITE_FUNCTIONS_EMULATOR_PORT || 
                         process.env.FIREBASE_FUNCTIONS_EMULATOR_PORT || 
                         '5001')
    connectFunctionsEmulator(functions, host, port)
    console.log(`[firebase] Using Functions emulator: ${host}:${port}`)
  }

  console.log('[firebase] Boot complete. Auth persistence set.')
})