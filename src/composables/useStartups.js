/*
  ────────────────────────────────────────────────────────────────
  Composable: useStartups.js
  Purpose: Client-side helper to interact with /events/{eventId}/startups
  Provides:
    • addStartup() → calls Cloud Function 'createStartup'
    • updateStartup() → calls Cloud Function 'updateStartup'
    • deleteStartup() → calls Cloud Function 'deleteStartup'
    • subscribeToStartups() → real-time listener for startup list
  ────────────────────────────────────────────────────────────────
*/
import { ref } from 'vue'
import { httpsCallable } from 'firebase/functions'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db, functions } from 'boot/firebase'

export function useStartups() {
  const loading = ref(false)
  const error = ref(null)

  /** Create a startup via Cloud Function */
  async function addStartup({ eventId, name, description, industry, website }) {
    loading.value = true
    error.value = null

    try {
      // ✅ Client-side validation
      if (!eventId || typeof eventId !== 'string') {
        throw new Error('Valid event ID is required')
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Startup name is required')
      }

      // Trim inputs before sending
      const payload = {
        eventId: eventId.trim(),
        name: name.trim(),
        description: description?.trim() || '',
        industry: industry?.trim() || '',
        website: website?.trim() || ''
      }

      const addStartupFn = httpsCallable(functions, 'createStartup')
      const res = await addStartupFn(payload)

      console.log('✅ Startup created:', res.data)
      return res.data

    } catch (err) {
      console.error('❌ Error adding startup:', err)
      error.value = err.message || 'Failed to add startup'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Update an existing startup via Cloud Function */
  async function updateStartup({ eventId, startupId, name, description, industry, website }) {
    loading.value = true
    error.value = null

    try {
      // ✅ Client-side validation
      if (!eventId || typeof eventId !== 'string') {
        throw new Error('Valid event ID is required')
      }

      if (!startupId || typeof startupId !== 'string') {
        throw new Error('Valid startup ID is required')
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Startup name is required')
      }

      // Trim inputs before sending
      const payload = {
        eventId: eventId.trim(),
        startupId: startupId.trim(),
        name: name.trim(),
        description: description?.trim() || '',
        industry: industry?.trim() || '',
        website: website?.trim() || ''
      }

      const updateStartupFn = httpsCallable(functions, 'updateStartup')
      const res = await updateStartupFn(payload)

      console.log('✅ Startup updated:', res.data)
      return res.data

    } catch (err) {
      console.error('❌ Error updating startup:', err)
      error.value = err.message || 'Failed to update startup'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Delete a startup via Cloud Function */
  async function deleteStartup({ eventId, startupId }) {
    loading.value = true
    error.value = null

    try {
      // ✅ Client-side validation
      if (!eventId || typeof eventId !== 'string') {
        throw new Error('Valid event ID is required')
      }

      if (!startupId || typeof startupId !== 'string') {
        throw new Error('Valid startup ID is required')
      }

      const payload = {
        eventId: eventId.trim(),
        startupId: startupId.trim()
      }

      const deleteStartupFn = httpsCallable(functions, 'deleteStartup')
      const res = await deleteStartupFn(payload)

      console.log('✅ Startup deleted:', res.data)
      return res.data

    } catch (err) {
      console.error('❌ Error deleting startup:', err)
      error.value = err.message || 'Failed to delete startup'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** 
   * Real-time subscription to event startups
   * @returns unsubscribe function - IMPORTANT: Call this when component unmounts!
   */
function subscribeToStartups(eventId, targetRef) {
  if (!eventId) {
    console.error('❌ subscribeToStartups: eventId is required')
    return () => {}
  }

  console.log('🔍 subscribeToStartups called with eventId:', eventId)
  console.log('🔍 Full path will be:', `events/${eventId}/startups`)

  try {
    const collectionRef = collection(db, `events/${eventId}/startups`)
    console.log('🔍 Collection reference created:', collectionRef.path)
    
    const q = query(
      collectionRef,
      orderBy('createdAt', 'desc')
    )
    console.log('🔍 Query created with orderBy')

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📊 Snapshot received!')
        console.log('📊 Number of docs:', snapshot.docs.length)
        console.log('📊 Snapshot metadata:', snapshot.metadata)
        
        if (snapshot.docs.length > 0) {
          snapshot.docs.forEach((doc, index) => {
            console.log(`📄 Doc ${index + 1}:`, {
              id: doc.id,
              data: doc.data(),
              exists: doc.exists
            })
          })
        } else {
          console.warn('⚠️ Snapshot is empty - no documents found')
        }
        
        targetRef.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        
        console.log('✅ targetRef updated with', targetRef.value.length, 'startups')
      },
      (err) => {
        console.error('❌ onSnapshot ERROR:')
        console.error('Error object:', err)
        console.error('Error code:', err.code)
        console.error('Error message:', err.message)
        console.error('Error name:', err.name)
      }
    )

    console.log('✅ Subscription listener attached')
    return unsubscribe

  } catch (err) {
    console.error('❌ Failed to subscribe to startups:', err)
    return () => {}
  }
}

  return { 
    addStartup,
    updateStartup,
    deleteStartup,
    subscribeToStartups,
    loading,
    error 
  }
}