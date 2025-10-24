import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { firebaseApp } from 'boot/firebase'
import { normalizeEmail } from './normalizeEmail'

let functionsInstance

function getFunctionsInstance() {
  if (functionsInstance) {
    return functionsInstance
  }

  functionsInstance = getFunctions(firebaseApp)

  if (import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === 'true') {
    const host = import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST || 'localhost'
    const port = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT || 5001)
    connectFunctionsEmulator(functionsInstance, host, port)
  }

  return functionsInstance
}

export async function reservePerson(email, firstName = '', lastName = '') {
  const normalizedEmail = normalizeEmail(email)
  const functions = getFunctionsInstance()
  const reserveFn = httpsCallable(functions, 'reservePersonByEmail')
  const { data } = await reserveFn({ email: normalizedEmail, firstName, lastName })
  return data
}
