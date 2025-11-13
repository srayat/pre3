// composables/useEventResults.js
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { doc, collection, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from 'boot/firebase'

export function useEventResults(eventId) {
  const status = ref('loading')
  const results = ref(null)
  const error = ref(null)
  const generatedAt = ref(null)

  let unsubscribe = null

  const subscribeToResults = () => {
    // Guard: Don't subscribe if eventId is not available
    const id = typeof eventId === 'object' ? eventId.value : eventId

    if (!id) {
      console.log('⏸️ useEventResults: No eventId yet, waiting...')
      status.value = 'loading'
      return
    }

    console.log('🔍 useEventResults: Subscribing to event:', id)
    const eventRef = doc(db, 'events', id)

    unsubscribe = onSnapshot(
      eventRef,
      async (eventSnap) => {
        if (!eventSnap.exists()) {
          status.value = 'error'
          error.value = 'Event not found'
          return
        }

        const eventData = eventSnap.data()

        if (eventData.status !== 'ended') {
          status.value = 'not_ended'
          return
        }

        if (!eventData.resultsReady) {
          status.value = 'processing'
          return
        }

        if (eventData.resultsError) {
          status.value = 'error'
          error.value = eventData.resultsError
          return
        }

        // Results are ready, fetch them
        const resultsRef = collection(db, `events/${id}/results`)
        const resultsSnap = await getDocs(resultsRef)

        const resultsData = {}
        resultsSnap.forEach((doc) => {
          resultsData[doc.id] = doc.data()
        })

        results.value = resultsData
        generatedAt.value = eventData.resultsGeneratedAt
        status.value = 'ready'
      },
      (err) => {
        console.error('❌ useEventResults snapshot error:', err)
        status.value = 'error'
        error.value = err.message
      },
    )
  }

  // Watch for eventId changes (handles reactive eventId)
  if (typeof eventId === 'object') {
    watch(
      eventId,
      (newId) => {
        if (unsubscribe) unsubscribe()
        if (newId) subscribeToResults()
      },
      { immediate: true },
    )
  } else {
    onMounted(() => {
      subscribeToResults()
    })
  }

  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  return {
    status,
    results,
    error,
    generatedAt,
  }
}
