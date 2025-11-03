/*
  ──────────────────────────────────────────────────────────────────────────────
  Composable: useFounderInvite.js
  Location:   src/composables/useFounderInvite.js
  ──────────────────────────────────────────────────────────────────────────────
  PURPOSE
  • Provides composable functions to send founder invitation emails
    from the client side (Vue + Quasar) to a Firebase Cloud Function.
  • Wraps async logic for handling invite requests and responses,
    centralizing error handling and notifications.

  USAGE CONTEXT
  • Originally paired with AddFounderInviteForm.vue for Version 2 (invite-based flow).
  • Can be reintroduced later when "Founder Claim Flow" is activated.

  EXAMPLE USAGE
  -------------------------------------------------------------------------------
    import { useFounderInvite } from 'src/composables/useFounderInvite'

    const { sendInvite } = useFounderInvite()
    await sendInvite({ founderEmail: 'founder@startup.com', eventId: 'EVT123' })
  -------------------------------------------------------------------------------

  DEPENDENCIES
  • Firebase Functions SDK
  • Quasar Notify (for optional UI feedback)
  • Firestore / Functions initialized via boot/firebase

  FUNCTIONS EXPOSED
  -------------------------------------------------------------------------------
  sendInvite({ founderEmail, eventId })
    → Validates input, calls Cloud Function 'sendFounderInvite',
      returns result or throws error.
  -------------------------------------------------------------------------------

  FLOW
  1. Validate that founderEmail and eventId are provided.
  2. Call Firebase Cloud Function 'sendFounderInvite' using httpsCallable().
  3. Await response; handle success/error.
  4. Return structured message (used by calling component for notifications).

  FUTURE ENHANCEMENTS
  • Add resendInvite() and revokeInvite() wrappers.
  • Include startupId for specific claim invites.
  • Track invites in Firestore for analytics.

  LAST UPDATED: 2025-11-02
  AUTHOR: [Your Name]
  ──────────────────────────────────────────────────────────────────────────────
*/

// Example stub (safe to keep commented until reused)
/*
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useQuasar } from 'quasar'

export function useFounderInvite() {
  const $q = useQuasar()
  const functions = getFunctions()
  const sendInviteFn = httpsCallable(functions, 'sendFounderInvite')

  async function sendInvite({ founderEmail, eventId }) {
    if (!founderEmail || !eventId) throw new Error('Missing required fields')
    const res = await sendInviteFn({ founderEmail, eventId })
    return res.data
  }

  return { sendInvite }
}
*/



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
