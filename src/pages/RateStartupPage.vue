<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-xs q-mt-xl">
      <q-btn icon="arrow_back" flat round @click="goBack" class="" />
      <div class="text-h5 text-weight-bold">{{ startup?.name }}</div>
      <div class="q-px-md"></div>
    </div>
    <div class="text-h6 flex flex-center text-grey-7 q-mb-xl">
      Share your feedback on their pitch
    </div>

    <!-- Ratings -->
    <div class="rating-container" style="max-width: 700px; margin: 0 auto">
      <div v-for="question in ratingQuestions" :key="question.id" class="rating-question q-mb-xl">
        <div class="text-h6 q-mb-md">{{ question.text }}</div>
        <div class="row justify-between items-center q-mb-sm">
          <span class="text-caption text-grey-7">Needs Improvement</span>
          <span class="text-caption text-grey-7">Excellent</span>
        </div>

        <q-rating
          v-model="ratings[question.id]"
          :max="10"
          size="2.5em"
          color="orange"
          icon="star_border"
          icon-selected="star"
          class="full-width justify-center"
        />
        <div class="text-center text-h6 q-mt-md text-orange">
          {{ ratings[question.id] || 0 }}/10
        </div>
      </div>

      <!-- Comments -->
      <div class="comments-section q-mb-xl">
        <div class="text-h6 q-mb-md">Additional Feedback</div>
        <q-input
          v-model="comments"
          type="textarea"
          placeholder="What did you think of their pitch?"
          rows="5"
          outlined
        />
        <div class="text-caption text-grey-6">
          Your feedback will be shared anonymously with the startup team
        </div>
      </div>

      <!-- Submit -->
      <div class="text-center">
        <q-btn
          label="Submit Rating"
          color="primary"
          size="lg"
          :disable="!isRatingValid"
          :loading="isSubmitting"
          @click="submitRating"
          class="q-px-xl"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from 'stores/event-store'
import { db, auth } from 'boot/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { Notify } from 'quasar'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()

const currentUser = auth.currentUser
const user = currentUser || eventStore.currentUser

// 🔹 Use eventId directly from route if available
const eventId =
  route.params.eventId || eventStore.currentEvent?.id || localStorage.getItem('currentEventId')

const ratings = ref({})
const comments = ref('')
const isSubmitting = ref(false)
const startup = ref(null)

const ratingQuestions = [
  { id: 'clarity', text: 'How clear and understandable was their business idea?' },
  { id: 'potential', text: 'Market potential and scalability of their solution?' },
  { id: 'team', text: 'Strength and experience of the founding team?' },
  { id: 'innovation', text: 'How innovative and unique is their approach?' },
  { id: 'presentation', text: 'Quality and effectiveness of their pitch delivery?' },
]

const isRatingValid = computed(() => {
  return Object.values(ratings.value).some((r) => r > 0)
})

const goBack = () => router.back()

const submitRating = async () => {
  if (!isRatingValid.value) return

  console.log('🧩 DEBUG eventId:', eventId)
  console.log('🧩 DEBUG user:', user)

  if (!eventId || !user) {
    Notify.create({ message: 'Missing event or user context', color: 'negative' })
    return
  }

  isSubmitting.value = true

  try {
    const totalScore = Object.values(ratings.value).reduce((a, b) => a + (b || 0), 0)
    const ratingData = {
      eventId,
      startupId: route.params.startupId,
      startupName: startup.value?.name || '',
      userId: user.uid,
      userEmail: user.email,
      ratings: ratings.value,
      totalScore,
      comments: comments.value,
      timestamp: serverTimestamp(),
    }

    // 🔹 1. Primary detailed rating under each startup
    const ratingDocRef = doc(
      db,
      `events/${eventId}/startups/${route.params.startupId}/ratings/${user.uid}`,
    )

    await setDoc(ratingDocRef, ratingData, { merge: true })

    // 🔹 2. Mirror lightweight summary under /events/{eventId}/ratings/
    const eventRatingRef = doc(
      db,
      `events/${eventId}/ratings/${route.params.startupId}_${user.uid}`,
    )
    await setDoc(eventRatingRef, {
      startupId: route.params.startupId,
      startupName: startup.value?.name || '',
      userId: user.uid,
      totalScore,
      timestamp: serverTimestamp(),
    })

    Notify.create({ message: 'Rating submitted successfully!', color: 'positive', position: 'top' })
    router.back()
  } catch (err) {
    console.error('Submit error:', err)
    Notify.create({ message: 'Error submitting rating.', color: 'negative' })
  } finally {
    isSubmitting.value = false
  }
}

if (!eventStore.currentEvent && eventId) {
  eventStore.currentEvent = { id: eventId } // minimal stub
}

// 🔹 Fetch startup name directly from the event’s subcollection
onMounted(async () => {
  const startupId = route.params.startupId
  const resolvedEventId = route.params.eventId || eventId

  if (!resolvedEventId || !startupId) {
    Notify.create({ message: 'Missing event or startup info', color: 'negative' })
    router.replace('/home')
    return
  }

  try {
    const startupRef = doc(db, `events/${resolvedEventId}/startups/${startupId}`)
    const startupSnap = await getDoc(startupRef)

    if (startupSnap.exists()) {
      startup.value = { id: startupSnap.id, ...startupSnap.data() }
    } else {
      // fallback (should rarely happen)
      startup.value = { id: startupId, name: 'Unknown Startup' }
    }
  } catch (err) {
    console.error('Error loading startup:', err)
    startup.value = { id: startupId, name: 'Unknown Startup' }
  }
})
</script>

<style scoped>
.rating-question {
  padding: 24px;
  border-radius: 12px;
  background: #f8f9fa;
  border-left: 4px solid #ff9800;
}
.comments-section {
  padding: 24px;
  border-radius: 12px;
  background: #f8f9fa;
  border-left: 4px solid #2196f3;
}
</style>
