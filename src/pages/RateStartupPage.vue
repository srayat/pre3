<template>
  <q-page class="q-pa-lg">
    <!-- Header with Back Button -->
    <div class="row items-center q-mb-xl">
      <q-btn 
        icon="arrow_back" 
        flat 
        round
        @click="goBack" 
        class="q-mr-md"
      />
      <div>
        <div class="text-h4 text-weight-bold">Rate {{ startup?.name }}</div>
        <div class="text-subtitle1 text-grey-7">Share your feedback on their pitch</div>
      </div>
    </div>

    <!-- Rating Content -->
    <div class="rating-container" style="max-width: 700px; margin: 0 auto;">
      
      <!-- Rating Questions -->
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

      <!-- Comments Section -->
      <div class="comments-section q-mb-xl">
        <div class="text-h6 q-mb-md">Additional Feedback</div>
        <q-input
          v-model="comments"
          type="textarea"
          placeholder="What did you think of their pitch? Any specific suggestions for improvement? What stood out to you?"
          rows="5"
          outlined
          class="q-mb-sm"
        />
        <div class="text-caption text-grey-6">
          Your feedback will be shared anonymously with the startup team
        </div>
      </div>

      <!-- Submit Button -->
      <div class="text-center">
        <q-btn 
          label="Submit Rating" 
          color="primary" 
          size="lg"
          @click="submitRating"
          :disable="!isRatingValid"
          :loading="isSubmitting"
          class="q-px-xl"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from 'src/stores/event-store'

export default {
  name: 'RateStartupPage',
  setup() {
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
      return Object.values(ratings.value).some(rating => rating > 0)
    })

    const goBack = () => {
      router.back()
    }

    const submitRating = async () => {
      if (!isRatingValid.value) return
      
      isSubmitting.value = true
      try {
        const ratingData = {
          startupId: route.params.startupId,
          startupName: startup.value?.name,
          eventId: eventStore.currentEvent?.id,
          ratings: ratings.value,
          comments: comments.value,
          timestamp: new Date()
        }
        
        // TODO: Save to Firestore
        console.log('Submitting rating:', ratingData)
        
        // Show success message and go back
        // You can add a Quasar notify here
        router.back()
        
      } catch (error) {
        console.error('Error submitting rating:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(() => {
      // TODO: Fetch startup details from Firestore using route.params.startupId
      // For now, mock data
      startup.value = {
        id: route.params.startupId,
        name: 'Startup ' + route.params.startupId,
        description: 'Loading startup details...'
      }
    })

    return {
      ratings,
      comments,
      isSubmitting,
      startup,
      ratingQuestions,
      isRatingValid,
      goBack,
      submitRating
    }
  }
}
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