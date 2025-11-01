// functions/getHostEvents.js
const { HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Initialize only once
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Fetch all events where the current user is the host.
 */
async function getHostEvents(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in to list events.");
  }

  const uid = request.auth.uid;

  try {
    const snapshot = await db
      .collection("events")
      .where("hostUid", "==", uid)
      .orderBy("updatedAt", "desc")
      .get();

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, events };
  } catch (error) {
    console.error("Error fetching host events:", error);
    throw new HttpsError("internal", "Could not fetch host events.");
  }
}

// Export only the function handler (no onCall here)
module.exports = { getHostEvents };