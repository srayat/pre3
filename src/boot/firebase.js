import { boot } from 'quasar/wrappers'
import { getApps, initializeApp } from 'firebase/app'
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

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
  // Helps surface misconfiguration early without crashing the dev server.
  console.warn(
    `[firebase] Missing configuration for: ${missingKeys.join(', ')}. Check your environment variables.`
  )
}

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

export { firebaseApp, auth, db }

export default boot(async () => {
  if (typeof window === 'undefined') {
    return
  }

  await setPersistence(auth, browserLocalPersistence)

  const shouldUseAuthEmulator = process.env.FIREBASE_USE_AUTH_EMULATOR === 'true'

  if (shouldUseAuthEmulator) {
    const host = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'
    const emulatorUrl = host.startsWith('http') ? host : `http://${host}`
    connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true })
  }
})
