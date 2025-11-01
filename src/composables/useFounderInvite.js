// src/composables/useFounderInvite.js
import { getFunctions, httpsCallable } from 'firebase/functions'
import { firebaseApp } from 'boot/firebase'

// Initialize Cloud Functions for this app once
const functions = getFunctions(firebaseApp)

export function useFounderInvite() {
  async function sendInvite({ founderEmail, eventId }) {
    try {
      const sendFounderInvite = httpsCallable(functions, 'sendFounderInvite')
      const res = await sendFounderInvite({ founderEmail, eventId })
      return res.data
    } catch (error) {
      console.error('❌ Error sending founder invite:', error)
      throw error
    }
  }

  return { sendInvite }
}
