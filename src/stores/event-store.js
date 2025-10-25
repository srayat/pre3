import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore' // Removed setDoc
import { db } from 'boot/firebase'
import { useUserStore } from './user-store'

export const useEventStore = defineStore('event', () => {
  // ========== STATE ==========
  const currentEvent = ref(null)
  const eventCode = ref('')
  const isLoading = ref(false)
  const error = ref('')
  const userStore = useUserStore()

  // ========== GETTERS ==========
  const hasCompletedOnboarding = computed(() => {
    if (!currentEvent.value || !userStore.user) return false
    return userStore.user.completedEvents?.includes(currentEvent.value.id)
  })

  // ========== ACTIONS ==========
 const validateEventCode = async (code) => {
  console.log('validateEventCode called with:', code)
  
  if (!code || code.length !== 4) {
    error.value = 'Please enter a valid 4-digit code'
    console.log('Code validation failed - not 4 digits')
    return false
  }

  isLoading.value = true
  error.value = ''

  try {
    console.log('Querying Firestore for event:', code.toUpperCase())
    const eventRef = doc(db, 'events', code.toUpperCase())
    const eventSnap = await getDoc(eventRef)

    console.log('Firestore response:', eventSnap.exists())
    
    if (!eventSnap.exists()) {
      error.value = 'Invalid event code'
      console.log('Event does not exist in Firestore')
      return false
    }

    const eventData = eventSnap.data()
    console.log('Event data found:', eventData)
    currentEvent.value = { id: eventSnap.id, ...eventData }

    if (eventData.status === 'ended') {
      error.value = 'This event has ended'
      console.log('Event has ended status')
      return false
    }

    if (eventData.status === 'setup') {
      error.value = 'Event is still being set up'
      console.log('Event is in setup status')
      return false
    }

    if (eventData.status === 'live' && userStore.user) {
      console.log('Event is live, handling first time join')
      await handleFirstTimeJoin(eventSnap.id)
    }

    console.log('Event validation successful!')
    return true

  } catch (err) {
    console.error('Error in validateEventCode:', err)
    error.value = 'Error validating event code: ' + err.message
    return false
  } finally {
    isLoading.value = false
  }
}

  const handleFirstTimeJoin = async (eventId) => { // Removed eventData parameter
    const userRef = doc(db, 'users', userStore.user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) return

    const userData = userSnap.data()
    const hasJoinedBefore = userData.joinedEvents?.includes(eventId)

    if (!hasJoinedBefore) {
      await updateDoc(userRef, {
        joinedEvents: arrayUnion(eventId),
        premoney: (userData.premoney || 0) + 10000,
        totalEvents: (userData.totalEvents || 0) + 1
      })

      userStore.user.premoney = (userData.premoney || 0) + 10000
      userStore.user.joinedEvents = [...(userData.joinedEvents || []), eventId]
    }
  }

  const completeOnboarding = async () => {
    if (!currentEvent.value || !userStore.user) return

    try {
      const userRef = doc(db, 'users', userStore.user.uid)
      await updateDoc(userRef, {
        completedEvents: arrayUnion(currentEvent.value.id)
      })

      if (!userStore.user.completedEvents) {
        userStore.user.completedEvents = []
      }
      userStore.user.completedEvents.push(currentEvent.value.id)
    } catch (err) {
      console.error('Error completing onboarding:', err)
    }
  }

  const resetEvent = () => {
    currentEvent.value = null
    eventCode.value = ''
    error.value = ''
  }

  return {
    currentEvent,
    eventCode,
    isLoading,
    error,
    hasCompletedOnboarding,
    validateEventCode,
    completeOnboarding,
    resetEvent
  }
})