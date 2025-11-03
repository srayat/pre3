/**
 * ────────────────────────────────────────────────────────────────
 * Cloud Function: updateStartup
 * Location: functions/updateStartup.js
 * ────────────────────────────────────────────────────────────────
 */
const { HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

if (!admin.apps.length) admin.initializeApp()
const db = admin.firestore()

async function updateStartup(request) {
  console.log('✏️ updateStartup called', {
    uid: request.auth?.uid,
    startupId: request.data?.startupId
  })

  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  const { eventId, startupId, name, description, industry, website } = request.data

  if (!eventId || !startupId) {
    throw new HttpsError('invalid-argument', 'Event ID and Startup ID are required.')
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'Startup name is required.')
  }

  try {
    const startupRef = db
      .collection('events')
      .doc(eventId)
      .collection('startups')
      .doc(startupId)

    const startupSnap = await startupRef.get()

    if (!startupSnap.exists) {
      throw new HttpsError('not-found', 'Startup not found.')
    }

    const startupData = startupSnap.data()

    // Check ownership
    if (startupData.ownerUid !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Only the owner can update this startup.')
    }

    const normalizedName = name.trim().toLowerCase()

    // Check for duplicate name (excluding current startup)
    if (normalizedName !== startupData.normalizedName) {
      const duplicateCheck = await db
        .collection('events')
        .doc(eventId)
        .collection('startups')
        .where('normalizedName', '==', normalizedName)
        .limit(1)
        .get()

      if (!duplicateCheck.empty && duplicateCheck.docs[0].id !== startupId) {
        throw new HttpsError(
          'already-exists',
          `A startup named "${name.trim()}" already exists in this event.`
        )
      }
    }

    const updates = {
      name: name.trim(),
      normalizedName,
      description: description?.trim() || '',
      industry: industry?.trim() || '',
      website: website?.trim() || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    await startupRef.update(updates)

    console.log('✅ Startup updated:', startupId)

    return {
      success: true,
      message: `Startup "${name.trim()}" updated successfully.`
    }

  } catch (error) {
    console.error('❌ Error updating startup:', error)
    
    if (error instanceof HttpsError) {
      throw error
    }
    
    throw new HttpsError('internal', 'Failed to update startup: ' + error.message)
  }
}

module.exports = { updateStartup }