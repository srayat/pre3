"use strict"

const {onCall, HttpsError} = require("firebase-functions/v2/https")
const {getFirestore, FieldValue} = require("firebase-admin/firestore")
const {getApps, initializeApp} = require("firebase-admin/app")
const {normalizeEmail, isValidEmail} = require("./utils/normalizeEmail")

if (!getApps().length) {
  initializeApp()
}

const db = getFirestore()

/**
 * Callable function used by event hosts to reserve a person record for
 * founders or judges. Ensures the same email always maps to a single person.
 */
exports.reservePersonByEmail = onCall(async (request) => {
  const emailInput = request?.data?.email
  const normalizedEmail = normalizeEmail(emailInput)

  if (!isValidEmail(normalizedEmail)) {
    throw new HttpsError("invalid-argument", "Invalid email format")
  }

  const firstName = (request?.data?.firstName || "").trim()
  const lastName = (request?.data?.lastName || "").trim()
  const emailRef = db.doc(`emailIndex/${normalizedEmail}`)

  return await db.runTransaction(async (tx) => {
    const emailSnap = await tx.get(emailRef)
    let personId

    if (emailSnap.exists) {
      personId = emailSnap.data().personId
    } else {
      personId = db.collection("people").doc().id
    }

    const personRef = db.doc(`people/${personId}`)
    const personDoc = await tx.get(personRef)
    const person = personDoc.data() || {}

    if (!personDoc.exists) {
      const timestamp = FieldValue.serverTimestamp()

      tx.set(personRef, {
        email: normalizedEmail,
        firstName,
        lastName,
        linkedUid: null,
        status: "invited",
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      tx.set(emailRef, {personId})
    } else {
      tx.set(emailRef, {personId}, {merge: true})
    }

    return {
      personId,
      status: person.linkedUid ? "registered" : "invited",
      linkedUid: person.linkedUid || null,
    }
  })
})
