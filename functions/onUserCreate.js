"use strict"

const {auth} = require("firebase-functions/v1")
const {getFirestore, FieldValue} = require("firebase-admin/firestore")
const {getApps, initializeApp} = require("firebase-admin/app")
const {normalizeEmail} = require("./utils/normalizeEmail")

if (!getApps().length) {
  initializeApp()
}

const db = getFirestore()

/**
 * Links a newly created Firebase Auth user to any reserved person record
 * that matches their email address, and marks relevant event roles as claimed.
 */
exports.linkUserToPerson = auth.user().onCreate(async (user) => {
  if (!user.email) {
    return
  }

  const email = normalizeEmail(user.email)
  const emailDoc = await db.doc(`emailIndex/${email}`).get()

  if (!emailDoc.exists) {
    return
  }

  const {personId} = emailDoc.data()
  const personRef = db.doc(`people/${personId}`)

  await personRef.update({
    linkedUid: user.uid,
    status: "registered",
    updatedAt: FieldValue.serverTimestamp(),
  })

  const batch = db.batch()

  const startupMatches = await db.collectionGroup("startups")
      .where("personId", "==", personId)
      .get()

  startupMatches.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      claimedByUid: user.uid,
      status: "claimed",
      updatedAt: FieldValue.serverTimestamp(),
    })
  })

  const judgeMatches = await db.collectionGroup("judges")
      .where("personId", "==", personId)
      .get()

  judgeMatches.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      claimedByUid: user.uid,
      status: "claimed",
      updatedAt: FieldValue.serverTimestamp(),
    })
  })

  await batch.commit()
})
