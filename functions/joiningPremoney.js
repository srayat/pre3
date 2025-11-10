const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getApps, initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

// Initialize app if not already initialized
if (!getApps().length) initializeApp()
const db = getFirestore()

/**
 * 🔹 joiningPremoney - Creates a Premoney wallet for a signed-in user when they join an event
 * and adds them to the event's investors subcollection.
 *
 * Creates two documents atomically:
 * 1. /users/{userId}/eventPremoneyAccounts/{eventId} - User's wallet
 * 2. /events/{eventId}/investors/{userId} - Event's investor record
 */
exports.joiningPremoney = onCall(async (request) => {
  const user = request.auth
  if (!user) {
    throw new HttpsError('unauthenticated', 'You must be signed in to join an event.')
  }

  const { eventId } = request.data || {}
  if (!eventId) {
    throw new HttpsError('invalid-argument', 'Missing eventId parameter.')
  }

  try {
    // --- Fetch event details ---
    const eventRef = db.collection('events').doc(String(eventId))
    const eventSnap = await eventRef.get()

    if (!eventSnap.exists) {
      throw new HttpsError('not-found', 'Event not found.')
    }

    const eventData = eventSnap.data()
    if (eventData.status !== 'live') {
      throw new HttpsError('failed-precondition', 'Event is not live yet.')
    }

    // --- Define initial Premoney allocation ---
    const startingBalance = eventData.startingPremoney || 10000

    // --- Check if user already joined ---
    const walletRef = db
      .collection('users')
      .doc(user.uid)
      .collection('eventPremoneyAccounts')
      .doc(String(eventId))

    const walletSnap = await walletRef.get()

    if (walletSnap.exists) {
      console.log(`User ${user.uid} already has a wallet for event ${eventId}.`)
      return { status: 'already_joined', wallet: walletSnap.data() }
    }

    // --- Create both wallet and investor record atomically ---
    const batch = db.batch()

    // 1. User-side wallet
    const walletData = {
      eventId: String(eventId),
      joinedAt: FieldValue.serverTimestamp(),
      remaining: startingBalance,
      totalAllocated: startingBalance,
      totalInvested: 0,
    }
    batch.set(walletRef, walletData)

    // 2. Event-side investor record
    const investorRef = db
      .collection('events')
      .doc(String(eventId))
      .collection('investors')
      .doc(user.uid)

    const investorData = {
      userId: user.uid,
      email: user.email || null,
      joinedAt: FieldValue.serverTimestamp(),
      startingBalance,
      currentBalance: startingBalance,
      totalInvested: 0,
    }
    batch.set(investorRef, investorData)

    // Commit both writes atomically
    await batch.commit()

    console.log(`✅ User ${user.uid} joined event ${eventId}: wallet + investor record created.`)

    return {
      status: 'success',
      wallet: walletData,
      investor: investorData,
    }
  } catch (error) {
    console.error('Error in joiningPremoney:', error)

    // Re-throw HttpsError as-is
    if (error instanceof HttpsError) {
      throw error
    }

    // Wrap other errors
    throw new HttpsError('internal', 'Failed to join event. Please try again.')
  }
})
