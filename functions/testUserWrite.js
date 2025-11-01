const { HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Don't initialize again if already done in index.js
const db = admin.firestore();

/**
 * Test 1: Write directly to /users/{userId} document
 */
async function testWriteUserDoc(request) {
  console.log("=== TEST 1: Write User Doc ===");
  console.log("Request object keys:", Object.keys(request));
  console.log("Request.auth:", request.auth);
  console.log("Request.data:", request.data);
  
  if (!request.auth) {
    console.error("❌ No auth in request!");
    throw new HttpsError("unauthenticated", "Must be signed in");
  }

  const userId = request.auth.uid;
  
  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    console.log("Writing to /users/" + userId);
    
    await db.collection("users").doc(userId).set({
      email: request.auth.token.email || "no-email",
      testField: "test123",
      createdAt: timestamp,
      updatedAt: timestamp,
    }, { merge: true });
    
    console.log("SUCCESS: User doc written");
    
    // Verify it was written
    const doc = await db.collection("users").doc(userId).get();
    console.log("Verification - Doc exists:", doc.exists);
    console.log("Verification - Data:", doc.data());
    
    return {
      success: true,
      message: "User doc created at /users/" + userId,
      exists: doc.exists,
      data: doc.data()
    };
    
  } catch (error) {
    console.error("ERROR:", error);
    throw new HttpsError("internal", error.message);
  }
}

/**
 * Test 2: Write to /users/{userId}/subcollection/{docId}
 */
async function testWriteUserSubcollection(request) {
  console.log("=== TEST 2: Write User Subcollection ===");
  console.log("Auth:", request.auth?.uid);
  
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in");
  }

  const userId = request.auth.uid;
  const docId = request.data.docId || "testdoc001";
  
  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    // First ensure parent exists
    console.log("Step 1: Writing parent /users/" + userId);
    await db.collection("users").doc(userId).set({
      email: request.auth.token.email || "no-email",
      createdAt: timestamp,
    }, { merge: true });
    console.log("Parent written");
    
    // Then write subcollection
    console.log("Step 2: Writing /users/" + userId + "/testcollection/" + docId);
    await db.collection("users").doc(userId).collection("testcollection").doc(docId).set({
      name: "test name",
      value: 42,
      createdAt: timestamp,
    });
    console.log("Subcollection doc written");
    
    // Verify
    const doc = await db.collection("users").doc(userId).collection("testcollection").doc(docId).get();
    console.log("Verification - Doc exists:", doc.exists);
    console.log("Verification - Data:", doc.data());
    
    return {
      success: true,
      message: "Subcollection doc created at /users/" + userId + "/testcollection/" + docId,
      exists: doc.exists,
      data: doc.data()
    };
    
  } catch (error) {
    console.error("ERROR:", error);
    throw new HttpsError("internal", error.message);
  }
}

/**
 * Test 3: Read from /users/ to test permissions
 */
async function testReadUserDoc(request) {
  console.log("=== TEST 3: Read User Doc ===");
  console.log("Auth:", request.auth?.uid);
  
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in");
  }

  const userId = request.auth.uid;
  
  try {
    console.log("Reading from /users/" + userId);
    
    const doc = await db.collection("users").doc(userId).get();
    
    console.log("Read complete - exists:", doc.exists);
    if (doc.exists) {
      console.log("Data:", doc.data());
    }
    
    return {
      success: true,
      exists: doc.exists,
      data: doc.exists ? doc.data() : null,
      message: doc.exists ? "User doc found" : "User doc does not exist"
    };
    
  } catch (error) {
    console.error("ERROR:", error);
    throw new HttpsError("internal", error.message);
  }
}

/**
 * Test 4: Batch write test
 */
async function testBatchWrite(request) {
  console.log("=== TEST 4: Batch Write ===");
  console.log("Auth:", request.auth?.uid);
  
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in");
  }

  const userId = request.auth.uid;
  
  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();
    
    // Write to user doc
    const userRef = db.collection("users").doc(userId);
    batch.set(userRef, {
      batchTest: true,
      createdAt: timestamp,
    }, { merge: true });
    
    // Write to subcollection
    const subRef = userRef.collection("batchtest").doc("batch001");
    batch.set(subRef, {
      name: "batch test",
      createdAt: timestamp,
    });
    
    console.log("Committing batch...");
    await batch.commit();
    console.log("Batch committed successfully");
    
    return {
      success: true,
      message: "Batch write completed for /users/" + userId
    };
    
  } catch (error) {
    console.error("ERROR:", error);
    throw new HttpsError("internal", error.message);
  }
}

module.exports = { 
  testWriteUserDoc, 
  testWriteUserSubcollection, 
  testReadUserDoc,
  testBatchWrite 
};