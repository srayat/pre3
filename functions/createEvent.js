const { HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

if (!admin.apps.length) admin.initializeApp()
const db = admin.firestore()

async function createEvent(request) {
  console.log('🚀🚀🚀 createEvent STARTED', {
    uid: request.auth?.uid,
    hasAuth: !!request.auth,
    dataKeys: Object.keys(request.data || {}),
  })

  if (!request.auth) {
    console.error('❌ No auth context')
    throw new HttpsError('unauthenticated', 'You must be signed in to create an event.')
  }

  const hostUid = request.auth.uid
  const hostEmail = request.auth.token.email || (await admin.auth().getUser(hostUid)).email

  console.log('✓ Host UID:', hostUid)

  const { name, description, date, location, capacity, isPublic } = request.data

  if (!name || typeof name !== 'string') {
    console.error('❌ Invalid name')
    throw new HttpsError('invalid-argument', 'Event name is required.')
  }

  console.log('✓ Validation passed')

  let eventCode

  try {
    // 🔹 Step 1: Generate a unique 5-digit numeric event code
    console.log('→ Generating event code...')
    for (let i = 0; i < 10; i++) {
      const candidate = Math.floor(10000 + Math.random() * 90000).toString()
      const snap = await db.collection('events').doc(candidate).get()
      if (!snap.exists) {
        eventCode = candidate
        break
      }
    }

    if (!eventCode) {
      console.error('❌ Could not generate event code')
      throw new Error('Could not generate unique event code after multiple attempts.')
    }

    console.log('✓ Event code generated:', eventCode)

    const timestamp = admin.firestore.FieldValue.serverTimestamp()

    // 🔹 Step 2: Main event data
    const eventData = {
      name: name.trim(),
      description: description?.trim() || '',
      date: date || null,
      location: location?.trim() || null,
      capacity: capacity || null,
      isPublic: !!isPublic,
      code: eventCode,
      hostUid,
      status: 'setup',
      createdAt: timestamp,
      updatedAt: timestamp,
      hostEmail,
    }

    // 🔹 Step 3: Write main event
    console.log('→ Writing main event to /events/' + eventCode)
    await db.collection('events').doc(eventCode).set(eventData)
    console.log('✅ Event document created successfully')

    // 🔹 Step 4: Check if we can even read from users collection
    console.log('→ Attempting to access user document at /users/' + hostUid)
    const userDocRef = db.collection('users').doc(hostUid)

    console.log('→ Checking if user document exists...')
    const userDoc = await userDocRef.get()
    console.log('✓ User doc check complete. Exists?', userDoc.exists)

    if (!userDoc.exists) {
      console.log('→ Creating user document...')
      await userDocRef.set(
        {
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        { merge: true },
      )
      console.log('✅ User document created')
    } else {
      console.log('✓ User document already exists')
    }

    // 🔹 Step 5: Create mirror
    console.log('→ Creating mirror at /users/' + hostUid + '/hostedEvents/' + eventCode)
    const mirrorRef = userDocRef.collection('hostedEvents').doc(eventCode)

    const mirrorData = {
      createdAt: timestamp,
      updatedAt: timestamp,
      role: 'host',
      eventId: eventCode,
    }

    console.log('→ Mirror data prepared:', mirrorData)
    console.log('→ Attempting mirror write...')

    await mirrorRef.set(mirrorData)

    console.log(
      '✅✅✅ Mirror created successfully at /users/' + hostUid + '/hostedEvents/' + eventCode,
    )

    // ✅ Return response
    console.log('→ Preparing return response')
    const response = { success: true, eventId: eventCode }
    console.log('✅ createEvent COMPLETED. Returning:', response)
    return response
  } catch (error) {
    console.error('❌❌❌ ERROR in createEvent:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      eventCode: eventCode || 'not generated yet',
    })
    throw new HttpsError('internal', error.message)
  }
}

// 🔹 Test function
async function testAddUserDoc(data, context) {
  console.log('🧪🧪🧪 testAddUserDoc STARTED', {
    uid: context.auth?.uid,
    hasAuth: !!context.auth,
    data: data,
  })

  if (!context.auth) {
    console.error('❌ No auth in test function')
    throw new HttpsError('unauthenticated', 'You must be signed in to run this test.')
  }

  const userId = context.auth.uid
  const testsubcollectionId = data.testsubcollectionId || 'testdoc001'

  console.log('✓ Test params:', { userId, testsubcollectionId })

  const timestamp = admin.firestore.FieldValue.serverTimestamp()

  try {
    console.log('→ Getting user doc ref at /users/' + userId)
    const userDocRef = db.collection('users').doc(userId)

    console.log('→ Checking if user doc exists...')
    const userDoc = await userDocRef.get()
    console.log('✓ User doc exists?', userDoc.exists)

    if (!userDoc.exists) {
      console.log('→ Creating user document for test...')
      await userDocRef.set(
        {
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        { merge: true },
      )
      console.log('✅ User document created for test')
    }

    console.log(
      '→ Creating test doc at /users/' + userId + '/testsubcollection/' + testsubcollectionId,
    )
    const docRef = userDocRef.collection('testsubcollection').doc(testsubcollectionId)

    const testData = {
      name: 'demouser',
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    console.log('→ Test data:', testData)
    await docRef.set(testData)

    console.log('✅✅✅ Test doc created successfully')

    const response = {
      success: true,
      message: `Test doc created at /users/${userId}/testsubcollection/${testsubcollectionId}`,
    }

    console.log('✅ testAddUserDoc COMPLETED. Returning:', response)
    return response
  } catch (error) {
    console.error('❌❌❌ ERROR in testAddUserDoc:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })
    throw new HttpsError('internal', error.message)
  }
}

module.exports = { createEvent, testAddUserDoc }
