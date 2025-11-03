/**
 * ────────────────────────────────────────────────────────────────
 * Cloud Function: deleteStartup
 * Location: functions/deleteStartup.js
 * ────────────────────────────────────────────────────────────────
 * PURPOSE
 * • Securely delete a startup document from /events/{eventId}/startups/
 * • Only the owner of the startup may delete it.
 * • Validates ownership before deletion.
 */
const { HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

if (!admin.apps.length) admin.initializeApp()
const db = admin.firestore()

async function deleteStartup(request) {
  console.log('🗑️ deleteStartup called', {
    uid: request.auth?.uid,
    eventId: request.data?.eventId,
    startupId: request.data?.startupId
  })

  // ✅ Auth check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  // ✅ Input validation
  const { eventId, startupId } = request.data

  if (!eventId || typeof eventId !== 'string') {
    throw new HttpsError('invalid-argument', 'Valid event ID is required.')
  }

  if (!startupId || typeof startupId !== 'string') {
    throw new HttpsError('invalid-argument', 'Valid startup ID is required.')
  }

  try {
    const startupRef = db
      .collection('events')
      .doc(eventId)
      .collection('startups')
      .doc(startupId)

    const startupSnap = await startupRef.get()

    // ✅ Check existence
    if (!startupSnap.exists) {
      throw new HttpsError('not-found', 'Startup not found.')
    }

    const startupData = startupSnap.data()
    const startupName = startupData.name || 'Unknown'

    // ✅ Check ownership
    if (startupData.ownerUid !== request.auth.uid) {
      throw new HttpsError(
        'permission-denied', 
        'Only the owner can delete this startup.'
      )
    }

    // ✅ Delete the startup
    await startupRef.delete()

    console.log('✅ Startup deleted:', startupId, startupName)

    return {
      success: true,
      message: `Startup "${startupName}" deleted successfully.`
    }

  } catch (error) {
    console.error('❌ Error deleting startup:', error)
    
    // Re-throw HttpsErrors as-is
    if (error instanceof HttpsError) {
      throw error
    }
    
    // Wrap other errors
    throw new HttpsError('internal', 'Failed to delete startup: ' + error.message)
  }
}

module.exports = { deleteStartup }