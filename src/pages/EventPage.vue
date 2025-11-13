<template>
  <q-page class="event-page column q-pa-lg">
    <!-- Show NOTHING except spinner while checking -->
    <div v-if="checking" class="column items-center justify-center" style="min-height: 80vh">
      <q-spinner color="primary" size="50px" />
    </div>

    <!-- Only show header + content if NOT checking -->
    <div v-else class="event-content column">
      <div class="event-content column">
        <!-- Navigation Header -->
        <div class="row justify-between items-center q-mb-lg q-pt-lg">
          <q-btn flat round icon="arrow_back" color="primary" @click="goBack" />
          <div class="text-h5 text-weight-bold text-primary q-ml-sm">{{ pageTitle }}</div>
          <div class="q-px-md"></div>
        </div>

        <!-- Checking State (Initial check before any content renders) -->
        <div v-if="checking" class="column items-center justify-center q-mt-xl">
          <q-spinner color="primary" size="50px" />
          <div class="text-body1 text-grey-7 q-mt-md">Loading event...</div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="column items-center justify-center q-mt-xl">
          <q-spinner color="primary" size="50px" />
          <div class="text-body1 text-grey-7 q-mt-md">Loading event...</div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="column items-center justify-center q-mt-xl">
          <q-icon name="error_outline" size="48px" color="negative" />
          <div class="text-h6 text-negative q-mt-md">{{ error }}</div>
          <q-btn
            label="Back to My Events"
            color="primary"
            flat
            class="q-mt-md"
            @click="router.push('/events')"
          />
        </div>

        <!-- Main Content: Only renders if NOT checking -->
        <div v-else>
          <!-- ========== SETUP STATUS ========== -->
          <div v-if="eventData.status === 'setup' && userRole === 'host'" class="management-view">
            <EventManagement :event-id="eventData.id" :event-data="eventData" />
          </div>

          <div v-else-if="eventData.status === 'setup'" class="no-access-view">
            <q-card flat bordered class="q-pa-lg text-center">
              <q-icon name="build" size="48px" color="grey-5" class="q-mb-md" />
              <div class="text-h6 text-grey-7 q-mb-sm">Setup In Progress</div>
              <div class="text-body2 text-grey-6">
                This event is being set up by the host. Check back soon!
              </div>
            </q-card>
          </div>

          <!-- ========== LIVE STATUS ========== -->
          <div
            v-else-if="eventData.status === 'live' && userRole === 'host'"
            class="management-view"
          >
            <EventManagement :event-id="eventData.id" :event-data="eventData" />
          </div>

          <!-- Live - Participant/Visitor (Should not render, redirects in script) -->
          <div
            v-else-if="eventData.status === 'live'"
            class="column items-center justify-center q-mt-xl"
          >
            <q-spinner color="primary" size="50px" />
            <div class="text-body1 text-grey-7 q-mt-md">Redirecting...</div>
          </div>

          <!-- ========== ENDED STATUS ========== -->
          <div v-else-if="eventData.status === 'ended'" class="results-view">
            <div
              v-if="resultsStatus === 'loading'"
              class="column items-center justify-center q-mt-xl"
            >
              <q-spinner color="primary" size="50px" />
              <div class="text-body1 text-grey-7 q-mt-md">Loading results...</div>
            </div>

            <div
              v-else-if="resultsStatus === 'processing'"
              class="column items-center justify-center q-mt-xl"
            >
              <q-spinner color="warning" size="50px" />
              <div class="text-h6 text-primary q-mt-md">Calculating Results...</div>
              <div class="text-body2 text-grey-7 q-mt-sm">
                This usually takes just a few seconds.
              </div>
            </div>

            <div
              v-else-if="resultsStatus === 'error'"
              class="column items-center justify-center q-mt-xl"
            >
              <q-icon name="error_outline" size="48px" color="negative" />
              <div class="text-h6 text-negative q-mt-md">Unable to Load Results</div>
              <div class="text-body2 text-grey-7 q-mt-sm">{{ resultsError }}</div>
            </div>

            <div v-else-if="resultsStatus === 'ready' && resultsData" class="results-content">
              <q-card flat bordered class="q-pa-lg q-mb-md">
                <div class="text-h6 text-center text-primary">{{ eventData.name }} - Results</div>
              </q-card>

              <div class="leaderboards-grid">
                <LeaderboardCard
                  v-if="resultsData.investmentLeaderboard"
                  :data="resultsData.investmentLeaderboard"
                />
                <LeaderboardCard
                  v-if="resultsData.ratingLeaderboard"
                  :data="resultsData.ratingLeaderboard"
                />
              </div>
            </div>
          </div>

          <!-- ========== FALLBACK ========== -->
          <div v-else class="no-access-view">
            <q-card flat bordered class="q-pa-lg text-center">
              <q-icon name="help_outline" size="48px" color="grey-5" class="q-mb-md" />
              <div class="text-h6 text-grey-7 q-mb-sm">Event Not Available</div>
              <div class="text-body2 text-grey-6">
                This event may not be available at this time.
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'
import { useQuasar } from 'quasar'
import { useEventResults } from 'src/composables/useEventResults'
import LeaderboardCard from 'src/components/LeaderboardCard.vue'
import EventManagement from 'src/components/EventManagement.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// State
const loading = ref(true)
const checking = ref(true) // ← Keep this
const error = ref(null)
const eventData = ref(null)
const userRole = ref(null)
const isParticipant = ref(false)
// Remove: const isRedirecting = ref(false) ← DELETE THIS LINE

// Computed
const pageTitle = computed(() => {
  if (!eventData.value) return 'Event'
  const status = eventData.value.status
  if (status === 'setup') return 'Setup Event'
  if (status === 'live') return 'Live Event'
  if (status === 'ended') return 'Event Results'
  return 'Event'
})

// Use results composable
const eventId = computed(() => eventData.value?.id)
const {
  status: resultsStatus,
  results: resultsData,
  error: resultsError,
} = useEventResults(eventId)

// Functions
function goBack() {
  router.push('/events')
}

async function checkIfParticipant(eventId, userId) {
  try {
    const investorRef = doc(db, `events/${eventId}/investors`, userId)
    const investorSnap = await getDoc(investorRef)
    return investorSnap.exists()
  } catch (error) {
    console.error('Error checking participant status:', error)
    return false
  }
}

// DELETE these two functions - not needed anymore
// function redirectToInvestment() { ... }
// function redirectToHome() { ... }

async function loadEvent() {
  try {
    loading.value = true
    checking.value = true
    error.value = null

    const currentEventId = route.params.eventId

    if (!currentEventId) {
      error.value = 'No event ID provided'
      checking.value = false
      loading.value = false
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      error.value = 'You must be signed in to view this event'
      checking.value = false
      loading.value = false
      router.push('/sign-in')
      return
    }

    const eventRef = doc(db, 'events', currentEventId)
    const eventSnap = await getDoc(eventRef)

    if (!eventSnap.exists()) {
      error.value = 'Event not found'
      checking.value = false
      loading.value = false
      return
    }

    const data = eventSnap.data()

    eventData.value = {
      id: currentEventId,
      name: data.name || 'Untitled Event',
      status: data.status || 'setup',
      description: data.description,
      date: data.date,
      ...data,
    }

    // Determine role and redirect if needed
    if (data.hostUid === currentUser.uid) {
      userRole.value = 'host'
      isParticipant.value = true
      // Host stays on page, so set checking to false
      checking.value = false
    } else {
      isParticipant.value = await checkIfParticipant(currentEventId, currentUser.uid)
      userRole.value = isParticipant.value ? 'participant' : 'visitor'

      // Redirect live events immediately
      if (eventData.value.status === 'live') {
        if (isParticipant.value) {
          console.log('🔀 Redirecting participant to investment page')
          // Stay in checking state, don't render anything
          router.replace(`/investment/${currentEventId}`)
          return // Exit without setting checking = false
        } else {
          console.log('🔀 Redirecting visitor to home page')
          // Stay in checking state, don't render anything
          router.replace('/home')
          return // Exit without setting checking = false
        }
      }

      // If not redirecting, allow page to render
      checking.value = false
    }

    console.log('👤 User role:', userRole.value)
    console.log('🎫 Is participant:', isParticipant.value)
  } catch (err) {
    console.error('Error loading event:', err)
    error.value = 'Failed to load event. Please try again.'
    checking.value = false
    loading.value = false
    $q.notify({
      type: 'negative',
      message: 'Error loading event',
    })
  } finally {
    // Only set loading to false if we're not redirecting
    if (!checking.value) {
      loading.value = false
    }
  }
}

onMounted(() => {
  loadEvent()
})
</script>

<style scoped>
.event-page {
  min-height: 100%;
  background: linear-gradient(180deg, #f1f5ff 0%, #ffffff 90%);
  padding-bottom: 100px;
}

.event-content {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.management-view,
.results-view,
.no-access-view {
  margin-top: 1rem;
}

.no-access-view {
  text-align: center;
}

.leaderboards-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
