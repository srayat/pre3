'use strict'

const { auth } = require('firebase-functions/v1')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { getApps, initializeApp } = require('firebase-admin/app')
const { normalizeEmail } = require('./utils/normalizeEmail')

if (!getApps().length) {
  initializeApp()
}

const db = getFirestore()

/**
 * Creates a user document for newly created Firebase Auth users,
 * and links them to any reserved person record that matches their email.
 */
exports.linkUserToPerson = auth.user().onCreate(async (user) => {
  console.log('🔥 linkUserToPerson fired for:', user.email) // debug
  const uid = user.uid
  const email = user.email

  // ✅ ALWAYS create a user document first
  const userRef = db.doc(`users/${uid}`)

  try {
    await userRef.set({
      email: email || null,
      createdAt: FieldValue.serverTimestamp(),
      profileComplete: false,
      // firstName and lastName will be added later via profile onboarding
    })
    console.log('✅ Created user doc:', user.uid) // debug
  } catch (error) {
    console.error('Error creating user document:', error) // debug
    return // Exit if we can't create the user doc
  }

  // If no email, stop here (user doc created but no linking possible)
  if (!email) {
    return
  }

  // ✅ Check if email exists in emailIndex for pre-invited users
  const normalizedEmail = normalizeEmail(email)
  const emailDoc = await db.doc(`emailIndex/${normalizedEmail}`).get()

  if (!emailDoc.exists) {
    // No pre-existing personId, so we're done
    return
  }

  // ✅ Link to personId if found
  const { personId } = emailDoc.data()
  const personRef = db.doc(`people/${personId}`)

  try {
    // Update the person record
    await personRef.update({
      linkedUid: uid,
      status: 'registered',
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Update user document with personId
    await userRef.update({
      personId: personId,
      updatedAt: FieldValue.serverTimestamp(),
    })

    // ✅ Claim all startup and judge roles linked to this personId
    const batch = db.batch()

    const startupMatches = await db
      .collectionGroup('startups')
      .where('personId', '==', personId)
      .get()

    startupMatches.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        claimedByUid: uid,
        status: 'claimed',
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    const judgeMatches = await db.collectionGroup('judges').where('personId', '==', personId).get()

    judgeMatches.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        claimedByUid: uid,
        status: 'claimed',
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    await batch.commit()

    console.log(`Successfully linked user ${uid} to person ${personId}`)
  } catch (error) {
    console.error('Error linking user to person:', error)
    // User doc still exists even if linking fails
  }
})
