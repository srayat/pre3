/**
 * ────────────────────────────────────────────────────────────────
 * Cloud Function: createStartup
 * Location: functions/createStartup.js
 * ────────────────────────────────────────────────────────────────
 * PURPOSE
 * • Securely create a startup document under /events/{eventId}/startups/
 * • Only the host of that event may create startups.
 * • Automatically normalizes data and sets server timestamps.
 */
const { HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

if (!admin.apps.length) admin.initializeApp()
const db = admin.firestore()

async function createStartup(request) {
  console.log('🚀 createStartup called', {
    uid: request.auth?.uid,
    eventId: request.data?.eventId
  })

  // ✅ Auth check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  // ✅ Input validation
  const { eventId, name, description, industry, website } = request.data

  if (!eventId || typeof eventId !== 'string') {
    throw new HttpsError('invalid-argument', 'Valid event ID is required.')
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'Startup name is required.')
  }

  try {
    // ✅ Fetch event to confirm host ownership
    const eventRef = db.collection('events').doc(eventId)
    const eventSnap = await eventRef.get()

    if (!eventSnap.exists) {
      throw new HttpsError('not-found', 'Event not found.')
    }

    const eventData = eventSnap.data()

    // ✅ Authorization check
    if (eventData.hostUid !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Only the event host can add startups.')
    }

    const normalizedName = name.trim().toLowerCase()

    // ✅ Check for duplicate startup name in this event
    const existingStartup = await eventRef
      .collection('startups')
      .where('normalizedName', '==', normalizedName)
      .limit(1)
      .get()

    if (!existingStartup.empty) {
      throw new HttpsError(
        'already-exists',
        `A startup named "${name.trim()}" already exists in this event.`
      )
    }

    // ✅ Create startup document
    const newStartup = {
      name: name.trim(),
      normalizedName,
      description: description?.trim() || '',
      industry: industry?.trim() || '',
      website: website?.trim() || '',
      ownerUid: request.auth.uid,
      ownerRole: 'host',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    const startupRef = await eventRef.collection('startups').add(newStartup)

    console.log('✅ Startup created:', startupRef.id)

    return {
      success: true,
      startupId: startupRef.id,
      message: `Startup "${name.trim()}" created successfully.`
    }

  } catch (error) {
    // ✅ Proper error handling
    console.error('❌ Error creating startup:', error)
    
    // Re-throw HttpsErrors as-is
    if (error instanceof HttpsError) {
      throw error
    }
    
    // Wrap other errors
    throw new HttpsError('internal', 'Failed to create startup: ' + error.message)
  }
}

module.exports = { createStartup }