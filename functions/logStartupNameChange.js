// functions/logStartupNameChange.js

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Initialize Admin SDK once safely
try {
  initializeApp();
} catch (e) {
  if (!/already exists/u.test(e.message)) throw e;
}

const db = getFirestore();

/**
 * Trigger: Fires when a startup document is updated.
 * Purpose: Log name changes into /startups/{id}/nameHistory.
 */
exports.logStartupNameChange = onDocumentUpdated("startups/{startupId}", async (event) => {
  // Ensure both before/after exist
  if (!event.data || !event.data.before.exists || !event.data.after.exists) return;

  const before = event.data.before.data();
  const after = event.data.after.data();
  const startupId = event.params.startupId;

  // Exit early if name hasn't changed
  if (!before || !after || before.name === after.name) return;

  // Prepare log
  const nameHistoryRef = db
    .collection("startups")
    .doc(startupId)
    .collection("nameHistory")
    .doc();

  await nameHistoryRef.set({
    oldName: before.name,
    newName: after.name,
    changedBy: after.lastModifiedBy || "unknown",
    changedAt: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Logged name change for ${startupId}: ${before.name} → ${after.name}`);
});
