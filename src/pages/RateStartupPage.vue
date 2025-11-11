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

    <!-- Loading State -->
    <div v-if="isLoadingQuestions" class="flex flex-center q-my-xl">
      <q-spinner size="48px" color="primary" />
      <div class="text-subtitle1 q-mt-md text-grey-7">Loading questions...</div>
    </div>

    <!-- Ratings -->
    <div v-else class="rating-container" style="max-width: 700px; margin: 0 auto">
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
import { useEventQuestions } from 'src/composables/useEventQuestions'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()

const currentUser = auth.currentUser
const user = currentUser || eventStore.currentUser

// 🔹 Ensure eventId is always a string
const eventId = String(
  route.params.eventId ||
    eventStore.currentEvent?.id ||
    localStorage.getItem('currentEventId') ||
    '',
).trim()

// 🔹 Ensure startupId is always a string
const startupId = String(route.params.startupId || '').trim()

const ratings = ref({})
const comments = ref('')
const isSubmitting = ref(false)
const startup = ref(null)

// ✅ Use the composable
const { audienceQuestions, isLoading: isLoadingQuestions, fetchQuestions } = useEventQuestions()

// ✅ Use questions from composable, fallback to hardcoded if empty
const ratingQuestions = computed(() => {
  if (audienceQuestions.value.length > 0) {
    return audienceQuestions.value
  }
  // Fallback to hardcoded questions
  return [
    { id: 'clarity', text: 'How clear and understandable was their business idea?' },
    { id: 'potential', text: 'Market potential and scalability of their solution?' },
    { id: 'team', text: 'Strength and experience of the founding team?' },
    { id: 'innovation', text: 'How innovative and unique is their approach?' },
    { id: 'presentation', text: 'Quality and effectiveness of their pitch delivery?' },
  ]
})

const isRatingValid = computed(() => {
  return Object.values(ratings.value).some((r) => r > 0)
})

const goBack = () => router.back()

const submitRating = async () => {
  if (!isRatingValid.value) return

  console.log('🧩 DEBUG eventId:', eventId, 'type:', typeof eventId)
  console.log('🧩 DEBUG startupId:', startupId, 'type:', typeof startupId)
  console.log('🧩 DEBUG user:', user)

  if (!eventId || !startupId || !user) {
    Notify.create({ message: 'Missing event, startup, or user context', color: 'negative' })
    return
  }

  isSubmitting.value = true

  try {
    const totalScore = Object.values(ratings.value).reduce((a, b) => a + (b || 0), 0)
    const ratingData = {
      eventId: String(eventId),
      startupId: String(startupId),
      startupName: startup.value?.name || '',
      userId: String(user.uid),
      userEmail: user.email,
      ratings: ratings.value,
      totalScore,
      comments: comments.value,
      timestamp: serverTimestamp(),
    }

    // 🔹 1. Primary detailed rating under each startup
    const ratingDocRef = doc(
      db,
      `events/${String(eventId)}/startups/${String(startupId)}/ratings/${String(user.uid)}`,
    )

    await setDoc(ratingDocRef, ratingData, { merge: true })

    // 🔹 2. Mirror lightweight summary under /events/{eventId}/ratings/
    const eventRatingRef = doc(
      db,
      `events/${String(eventId)}/ratings/${String(startupId)}_${String(user.uid)}`,
    )
    await setDoc(eventRatingRef, {
      startupId: String(startupId),
      startupName: startup.value?.name || '',
      userId: String(user.uid),
      totalScore,
      timestamp: serverTimestamp(),
    })

    Notify.create({ message: 'Rating submitted successfully!', color: 'positive', position: 'top' })
    // Add small delay before going back
    await new Promise((resolve) => setTimeout(resolve, 300))
    router.back()
  } catch (err) {
    console.error('Submit error:', err)
    Notify.create({ message: 'Error submitting rating.', color: 'negative' })
  } finally {
    isSubmitting.value = false
  }
}

if (!eventStore.currentEvent && eventId) {
  eventStore.currentEvent = { id: String(eventId) }
}

// 🔹 Fetch startup name and questions
onMounted(async () => {
  if (!eventId || !startupId) {
    Notify.create({ message: 'Missing event or startup info', color: 'negative' })
    router.replace('/home')
    return
  }

  // ✅ Fetch questions from composable
  await fetchQuestions(eventId)

  // Fetch startup info
  try {
    const startupRef = doc(db, `events/${String(eventId)}/startups/${String(startupId)}`)
    const startupSnap = await getDoc(startupRef)

    if (startupSnap.exists()) {
      startup.value = { id: startupSnap.id, ...startupSnap.data() }
    } else {
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
