<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-xl">
      <q-btn icon="arrow_back" flat round @click="goBack" class="q-mr-md" />
      <div>
        <div class="text-h5 text-weight-bold q-pt-lg">{{ startup?.name }}</div>
        <div class="text-h6 text-grey-7">Share your feedback on their pitch</div>
      </div>
    </div>

    <!-- Ratings -->
    <div class="rating-container" style="max-width: 700px; margin: 0 auto;">
      <div
        v-for="question in ratingQuestions"
        :key="question.id"
        class="rating-question q-mb-xl"
      >
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
import { db } from 'boot/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { Notify } from 'quasar'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()

const ratings = ref({})
const comments = ref('')
const isSubmitting = ref(false)
const startup = ref(null)

const ratingQuestions = [
  { id: 'clarity', text: 'How clear and understandable was their business idea?' },
  { id: 'potential', text: 'Market potential and scalability of their solution?' },
  { id: 'team', text: 'Strength and experience of the founding team?' },
  { id: 'innovation', text: 'How innovative and unique is their approach?' },
  { id: 'presentation', text: 'Quality and effectiveness of their pitch delivery?' }
]

const isRatingValid = computed(() => {
  return Object.values(ratings.value).some(r => r > 0)
})

const goBack = () => router.back()

const submitRating = async () => {
  if (!isRatingValid.value) return
  const eventId = eventStore.currentEvent?.id
  const user = eventStore.currentUser

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
      timestamp: serverTimestamp()
    }

    const ratingDocId = `${user.uid}_${route.params.startupId}`
    const ratingDocRef = doc(db, `events/${eventId}/ratings/${ratingDocId}`)

    await setDoc(ratingDocRef, ratingData, { merge: true }) // merge enables edits

    Notify.create({ message: 'Rating submitted successfully!', color: 'positive', position: 'top' })
    router.back()
  } catch (err) {
    console.error('Submit error:', err)
    Notify.create({ message: 'Error submitting rating.', color: 'negative' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  const startupId = route.params.startupId
  const startupDoc = await getDoc(doc(db, 'startups', startupId))
  startup.value = startupDoc.exists()
    ? { id: startupDoc.id, ...startupDoc.data() }
    : { id: startupId, name: `Startup ${startupId}` }
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
