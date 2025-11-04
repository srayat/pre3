import { ref, computed, reactive, watch } from 'vue'
import { db, auth } from 'boot/firebase'
import { doc, getDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore'
import { Notify } from 'quasar'

export function useInvestments(eventIdRef) {
  const user = auth.currentUser
  const totalAllocated = ref(0)
  const investments = reactive({}) // startupId → amount

  const totalInvested = computed(() =>
    Object.values(investments).reduce((sum, val) => sum + (val || 0), 0),
  )

  const remainingBalance = computed(() => Math.max(totalAllocated.value - totalInvested.value, 0))

  // --- 🔹 Internal helper to normalize eventId (string only) ---
  const normalizeId = (id) => {
    if (!id) return null
    if (typeof id === 'object' && id.value) return String(id.value)
    return String(id)
  }

  // --- 🔹 Fetch event wallet ---
  const fetchWallet = async (eventId) => {
    if (!eventId || !user) return
    const walletRef = doc(db, `users/${user.uid}/eventPremoneyAccounts/${eventId}`)
    const snap = await getDoc(walletRef)
    if (snap.exists()) {
      const data = snap.data()
      totalAllocated.value = data.totalAllocated || data.premoneyPerUser || 0
    } else {
      totalAllocated.value = 0
    }

    // Realtime wallet listener
    onSnapshot(walletRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        totalAllocated.value = data.totalAllocated || data.premoneyPerUser || 0
      }
    })
  }

  // --- 🔹 Listen to user’s investments in this event ---
  const listenInvestments = (eventId) => {
    if (!eventId || !user) return
    const invQuery = query(
      collection(db, `events/${eventId}/investments`),
      where('userId', '==', user.uid),
    )

    onSnapshot(invQuery, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        investments[data.startupId] = data.investedPM || 0
      })
    })
  }

  // --- 🔹 Update investment (on input change) ---
  const updateInvestment = async (startupId, amount, eventIsLive = true) => {
    if (!eventIsLive) {
      Notify.create({
        type: 'warning',
        message: 'Event has ended. You cannot modify investments.',
      })
      return
    }

    const potentialTotal = Object.entries(investments).reduce(
      (sum, [sid, val]) => sum + (sid === startupId ? amount : val || 0),
      0,
    )

    if (potentialTotal > totalAllocated.value) {
      Notify.create({
        type: 'negative',
        message: 'You cannot invest more than your available PreMoney balance.',
      })
      return
    }

    investments[startupId] = amount

    const eventId = normalizeId(eventIdRef)
    if (!eventId) return

    const invRef = doc(db, `events/${eventId}/investments/${user.uid}_${startupId}`)
    await setDoc(
      invRef,
      {
        userId: user.uid,
        eventId,
        startupId,
        investedPM: amount,
        updatedAt: new Date(),
      },
      { merge: true },
    )
  }

  // --- 🔹 Reactively initialize when eventId changes ---
  watch(
    () => normalizeId(eventIdRef),
    (newId) => {
      if (newId) {
        fetchWallet(newId)
        listenInvestments(newId)
      }
    },
    { immediate: true },
  )

  return {
    totalAllocated,
    investments,
    totalInvested,
    remainingBalance,
    updateInvestment,
  }
}
