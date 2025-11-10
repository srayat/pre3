import { ref, watch, onMounted, onUnmounted } from 'vue'
import { db, auth } from 'boot/firebase'
import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export function useRatings(eventIdRef) {
  const ratedStartups = ref(new Set())
  let unsubscribe = null
  let userUid = null

  const fetchRatings = async () => {
    if (!userUid || !eventIdRef.value) return

    try {
      // Get all startups in the event
      const startupsRef = collection(db, `events/${eventIdRef.value}/startups`)
      const startupsSnap = await getDocs(startupsRef)

      const ids = new Set()

      // Check each startup for user's rating
      for (const startupDoc of startupsSnap.docs) {
        const ratingRef = doc(
          db,
          `events/${eventIdRef.value}/startups/${startupDoc.id}/ratings/${userUid}`,
        )
        const ratingSnap = await getDoc(ratingRef)

        if (ratingSnap.exists()) {
          ids.add(startupDoc.id)
          console.log('✅ Found rating for startup:', startupDoc.id)
        }
      }

      ratedStartups.value = ids
      console.log('✅ Rated startups:', Array.from(ids))

      // Set up real-time listener for future rating changes
      if (unsubscribe) unsubscribe()

      // Listen to changes on each startup's rating document
      const unsubscribers = []
      startupsSnap.docs.forEach((startupDoc) => {
        const ratingRef = doc(
          db,
          `events/${eventIdRef.value}/startups/${startupDoc.id}/ratings/${userUid}`,
        )
        const unsub = onSnapshot(ratingRef, (snap) => {
          if (snap.exists()) {
            ratedStartups.value.add(startupDoc.id)
          } else {
            ratedStartups.value.delete(startupDoc.id)
          }
          console.log('🔄 Rating updated for:', startupDoc.id, snap.exists())
        })
        unsubscribers.push(unsub)
      })

      unsubscribe = () => unsubscribers.forEach((u) => u())
    } catch (err) {
      console.error('❌ Error fetching ratings:', err)
    }
  }

  // Watch for eventId change
  watch(eventIdRef, (newEventId) => {
    if (newEventId) fetchRatings()
  })

  // Wait for user auth
  onMounted(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        userUid = user.uid
        console.log('👤 Detected user UID:', userUid)
        fetchRatings()
      }
    })

    onUnmounted(() => {
      if (unsubscribeAuth) unsubscribeAuth()
      if (unsubscribe) unsubscribe()
    })
  })

  return { ratedStartups }
}
