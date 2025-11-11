import { ref } from 'vue'
import { db } from 'boot/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Notify } from 'quasar'

export function useEventQuestions() {
  const audienceQuestions = ref([])
  const judgeQuestions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Fetches audienceQuestions and judgeQuestions from the event document.
   * @param {string} eventId - The ID of the event in Firestore (/events/{eventId})
   */
  const fetchQuestions = async (eventId) => {
    if (!eventId) {
      console.warn('No eventId provided to fetchQuestions()')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const eventRef = doc(db, `events/${eventId}`)
      const snap = await getDoc(eventRef)

      if (!snap.exists()) {
        console.warn(`Event ${eventId} not found.`) // ✅ Fixed: parentheses
        error.value = 'Event not found'
        return
      }

      const data = snap.data()

      // ✅ Extract audience questions
      if (Array.isArray(data.audienceQuestions)) {
        audienceQuestions.value = data.audienceQuestions
          .filter((q) => q.type === 'rating')
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      } else {
        audienceQuestions.value = []
      }

      // ✅ Extract judge questions
      if (Array.isArray(data.judgeQuestions)) {
        judgeQuestions.value = data.judgeQuestions
          .filter((q) => q.type === 'rating')
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      } else {
        judgeQuestions.value = []
      }

      console.log('🎯 Loaded event questions:', {
        eventId,
        audienceCount: audienceQuestions.value.length,
        judgeCount: judgeQuestions.value.length,
      })
    } catch (err) {
      console.error('❌ Error loading event questions:', err)
      error.value = err.message || 'Failed to load questions'
      Notify.create({
        message: 'Error loading event questions',
        color: 'negative',
        position: 'top',
      })
    } finally {
      isLoading.value = false
    }
  }

  return {
    audienceQuestions,
    judgeQuestions,
    isLoading,
    error,
    fetchQuestions,
  }
}
