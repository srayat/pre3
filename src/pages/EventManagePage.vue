<template>
  <q-page class="event-manage-page column q-pa-lg">
    <!-- Main header - ONLY SHOW WHEN NO ACTIVE SECTION -->
    <div
      v-if="!activeSection"
      class="page-width row justify-between items-center q-col-gutter-sm q-py-lg"
    >
      <q-btn flat round icon="arrow_back" color="primary" @click="goBack" />
      <div class="text-h5 text-weight-bold text-primary q-ml-sm">Manage Event</div>
      <div></div>
    </div>

    <!-- Conditional rendering: Either show setup steps OR active section -->
    <div v-if="!activeSection" class="page-width">
      <setup-steps
        :loading="eventLoading"
        :recently-created="recentlyCreated"
        :event-data="eventData"
        :startup-count="startups.length"
        :judge-count="judges.length"
        :rating-questions-enabled="eventData?.ratingQuestionsEnabled"
        @open-section="openSection"
      />
    </div>

    <!-- Full-width sections when active -->
    <div v-else class="page-width full-section">
      <!-- Section header with back button - REPLACES MAIN HEADER -->
      <div class="row justify-between items-center q-mb-md q-mt-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="handleCloseSection"
          class="q-mr-sm"
        />
        <div class="text-h5 text-weight-bold">
          {{ getSectionTitle(activeSection) }}
        </div>
        <div></div>
      </div>

      <!-- Active section content -->
      <event-info-section
        v-if="activeSection === 'event-info'"
        :event-data="eventData"
        :loading="eventLoading"
        @close="handleCloseSection"
        @event-updated="handleEventUpdated"
        class=""
      />

      <startup-list-section
        v-else-if="activeSection === 'startup'"
        :startups="startups"
        :loading="inviteLoading.startup"
        :event-id="eventId"
        @close="handleCloseSection"
        @add-startup="submitStartup"
        class="bg-grey-4"
      />

      <judge-list-section
        v-else-if="activeSection === 'judge'"
        :judges="judges"
        :loading="inviteLoading.judge"
        :event-id="eventId"
        @close="handleCloseSection"
        @add-judge="submitJudge"
      />

      <rating-questions-section
        v-else-if="activeSection === 'rating'"
        :active="true"
        :event-id="eventId"
        @close="handleCloseSection"
      />
    </div>

    <!-- Status Cards Wrapper -->
    <div v-if="!activeSection">
      <!-- 1️⃣ SETUP -->
      <q-card v-if="status === 'setup'" class="q-pa-md q-mt-lg shadow-1 bg-grey-2">
        <div class="column items-center q-gutter-md border">
          <q-icon name="build_circle" size="48px" color="primary" />
          <div class="text-h6 text-weight-bold">Event in Setup</div>
          <div class="text-body2 text-grey-7 text-center q-mb-md">
            Complete your setup and click below when you’re ready to go live.
          </div>
          <q-btn
            color="positive"
            label="Go Live"
            icon="play_circle"
            unelevated
            :loading="goingLive"
            @click="confirmGoLive"
          />
        </div>
      </q-card>

      <!-- 2️⃣ LIVE -->
      <q-card
        v-else-if="status === 'live'"
        class="q-mt-xl q-pt-lg bg-grey-2 text-positive text-center"
        flat
        style="border-color: #2e7d32; border-width: 2px"
      >
        <div class="text-h6 text-weight-bold">✅ Event is now Live</div>
        <div class="text-subtitle1 text-grey-8 q-mb-md">
          Attendees can join and invest PreMoney in startups.
        </div>

        <!-- 🔴 End Event Button (still visually below but logically inside same block) -->
        <div class="q-mt-md flex justify-center">
          <q-btn
            color="negative"
            label="End Event"
            icon="stop_circle"
            unelevated
            :loading="endingEvent"
            @click="confirmEndEvent"
            class="q-px-lg full-width text-h6"
          />
        </div>
      </q-card>

      <!-- 3️⃣ ENDED -->
      <q-card
        v-else-if="status === 'ended'"
        class="q-pa-xl q-mt-lg bg-grey-5 text-white text-center"
        flat
        bordered
        style="border-color: #616161; border-width: 2px"
      >
        <div class="text-h6 text-weight-bold q-mb-md">⚪ Event has Ended</div>
        <div class="text-subtitle2">This event is no longer active for participation.</div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, updateDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'

// Component imports for event management features
import SetupSteps from 'components/event-manage/SetupSteps.vue'
import EventInfoSection from 'components/event-manage/EventInfoSection.vue'
import StartupListSection from 'components/event-manage/StartupListSection.vue'
import JudgeListSection from 'components/event-manage/JudgeListSection.vue'
import RatingQuestionsSection from 'components/event-manage/RatingQuestionsSection.vue'

// Vue and Quasar utilities
const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const goingLive = ref(false)
const status = ref('setup') // initial phase = setup
const endingEvent = ref(false)

// ========== REACTIVE STATES ==========

/** @type {import('vue').Ref<string>} Event ID from route parameters */
const eventId = ref(route.params.eventId)

/** @type {import('vue').Ref<object|null>} Current event data from Firestore */
const eventData = ref(null)

/** @type {import('vue').Ref<boolean>} Loading state for event data */
const eventLoading = ref(true) // Start as true to show loading

/** @type {import('vue').Ref<Array>} List of startups for this event */
const startups = ref([])

/** @type {import('vue').Ref<Array>} List of judges for this event */
const judges = ref([])

/** @type {import('vue').Ref<string|null>} Currently active section (startup/judge/rating) */
const activeSection = ref(null)

/** @type {import('vue').Ref<boolean>} Flag for showing creation success banner */
const recentlyCreated = ref(route.query.created === '1')

/** @type {object} Loading states for invite operations */
const inviteLoading = reactive({
  startup: false,
  judge: false,
})

// Firestore unsubscribe functions for cleanup
let unsubscribeEvent = null
let unsubscribeStartups = null
let unsubscribeJudges = null

// Section title helper
const getSectionTitle = (section) => {
  const titles = {
    'event-info': 'Event Information',
    startup: 'Manage Startups',
    judge: 'Manage Judges',
    rating: 'Configure Rating Questions',
  }
  return titles[section] || 'Manage Section'
}

// Handle event data updates
const handleEventUpdated = (updatedEventData) => {
  eventData.value = { ...eventData.value, ...updatedEventData }
  $q.notify({
    type: 'positive',
    message: 'Event updated successfully!',
    timeout: 2000,
  })
}

// ========== LIFECYCLE HOOKS ==========

/**
 * Component mounted lifecycle hook
 * Sets up authentication state listener and initial data loading
 */
onMounted(() => {
  console.log('EventManagePage mounted, eventId:', eventId.value)

  if (!eventId.value) {
    console.error('No eventId found in route parameters')
    handleInvalidEvent()
    return
  }

  // Start loading event data
  loadEventData()
})

/**
 * Component cleanup hook
 * Unsubscribes from all Firestore listeners to prevent memory leaks
 */
onUnmounted(() => {
  cleanupFirestoreListeners()
})

// ========== EVENT DATA MANAGEMENT ==========

/**
 * Loads event data from Firestore with authentication validation
 * Sets up real-time listener for event updates
 */
const loadEventData = async () => {
  if (!eventId.value) {
    handleInvalidEvent()
    return
  }

  eventLoading.value = true

  try {
    const eventRef = doc(db, 'events', eventId.value)

    // Set up real-time listener for event data
    unsubscribeEvent = onSnapshot(
      eventRef,
      // Success callback
      (snapshot) => {
        if (!snapshot.exists()) {
          console.error('Event document does not exist:', eventId.value)
          handleInvalidEvent()
          return
        }

        const data = snapshot.data()
        console.log('Event data loaded:', data)

        // Validate user access to this event
        if (!auth.currentUser || data.hostUid !== auth.currentUser.uid) {
          console.error('User does not have access to this event')
          handleUnauthorizedAccess()
          return
        }

        // Set event data and stop loading
        eventData.value = {
          id: snapshot.id,
          ...data,
        }
        eventLoading.value = false

        // Set up real-time listeners for startups and judges
        setupRealtimeListeners()

        // Auto-open startup section for newly created events
        // if (recentlyCreated.value && !activeSection.value) {
        //  activeSection.value = 'startup'
        // }
      },
      // Error callback
      (error) => {
        console.error('Error loading event data:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load event data. Please try again.',
          timeout: 3000,
        })
        eventLoading.value = false
      },
    )
  } catch (error) {
    console.error('Error setting up event listener:', error)
    eventLoading.value = false
    $q.notify({
      type: 'negative',
      message: 'Error accessing event data.',
      timeout: 3000,
    })
  }
}

/**
 * Sets up real-time Firestore listeners for startups and judges collections
 * These listeners automatically update the UI when data changes
 */
const setupRealtimeListeners = () => {
  // Startups collection listener
  const startupsRef = collection(db, 'events', eventId.value, 'startups')
  const startupsQuery = query(startupsRef, orderBy('createdAt', 'desc'))

  unsubscribeStartups = onSnapshot(
    startupsQuery,
    (snapshot) => {
      startups.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log('Startups updated, count:', startups.value.length)
    },
    (error) => {
      console.error('Error loading startups:', error)
    },
  )

  // Judges collection listener
  const judgesRef = collection(db, 'events', eventId.value, 'judges')
  const judgesQuery = query(judgesRef, orderBy('createdAt', 'desc'))

  unsubscribeJudges = onSnapshot(
    judgesQuery,
    (snapshot) => {
      judges.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log('Judges updated, count:', judges.value.length)
    },
    (error) => {
      console.error('Error loading judges:', error)
    },
  )
}

/**
 * Cleans up all Firestore listeners to prevent memory leaks
 */
const cleanupFirestoreListeners = () => {
  if (unsubscribeEvent) unsubscribeEvent()
  if (unsubscribeStartups) unsubscribeStartups()
  if (unsubscribeJudges) unsubscribeJudges()
}

// ========== EVENT HANDLERS ==========

/**
 * Handles invalid event scenarios (not found or invalid ID)
 * Redirects user to events list with appropriate error message
 */
const handleInvalidEvent = () => {
  eventLoading.value = false
  $q.notify({
    type: 'negative',
    message: 'Event not found or invalid event ID.',
    timeout: 3000,
  })
  router.push('/events')
}

/**
 * Handles unauthorized access attempts
 * Redirects user to home page with access denied message
 */
const handleUnauthorizedAccess = () => {
  eventLoading.value = false
  $q.notify({
    type: 'negative',
    message: 'You do not have access to manage this event.',
    timeout: 3000,
  })
  router.push('/home')
}

/**
 * Closes the currently active section and returns to main setup steps view
 */
const handleCloseSection = () => {
  activeSection.value = null
}

/**
 * Opens a specific management section (startup/judge/rating)
 * @param {string} section - The section to open
 */
const openSection = (section) => {
  activeSection.value = section
}

/**
 * Handles startup submission from StartupForm component
 * @param {object} startupData - Startup information from the form
 */
const submitStartup = async (startupData) => {
  console.log('Startup submission handled by StartupForm directly:', startupData)
  // Note: Startup saving is now handled directly in StartupForm.vue
  // This emit is kept for potential future centralized processing
}

/**
 * Handles judge submission from JudgeForm component
 * @param {object} judgeData - Judge information from the form
 */
const submitJudge = async (judgeData) => {
  console.log('Judge submission handled by JudgeForm directly:', judgeData)
  // Note: Judge saving is now handled directly in JudgeForm.vue
  // This emit is kept for potential future centralized processing
}

// Sync status from Firestore (eventData)
watch(
  eventData,
  (newVal) => {
    if (newVal && newVal.status) {
      status.value = newVal.status
    }
  },
  { immediate: true },
)

/**
 * Activate the Event - Go Live
 */
// 🔹 Go Live Action
async function confirmGoLive() {
  $q.dialog({
    title: 'Go Live',
    message: 'Make this event live? Attendees will be able to join and invest.',
    cancel: { label: 'Cancel', flat: true, color: 'grey' },
    ok: { label: 'Yes, Go Live', color: 'positive', icon: 'rocket_launch' },
    persistent: true,
  }).onOk(async () => {
    try {
      if (!eventData.value || !eventData.value.id) {
        $q.notify({ type: 'warning', message: 'Event not loaded yet.' })
        return
      }

      goingLive.value = true
      const eventRef = doc(db, 'events', eventData.value.id)
      await updateDoc(eventRef, { status: 'live', updatedAt: new Date() })

      status.value = 'live'
      eventData.value.status = 'live'

      $q.notify({ type: 'positive', message: '🚀 Event is now live!' })
    } catch (err) {
      console.error('❌ Go Live error:', err)
      $q.notify({ type: 'negative', message: 'Failed to go live. Try again.' })
    } finally {
      goingLive.value = false
    }
  })
}

// 🔹 End Event Action
async function confirmEndEvent() {
  $q.dialog({
    title: 'End Event',
    message:
      'Are you sure you want to end this event? Attendees will no longer be able to join or invest.',
    cancel: { label: 'Cancel', flat: true, color: 'grey' },
    ok: { label: 'Yes, End Event', color: 'negative', icon: 'stop_circle' },
    persistent: true,
  }).onOk(async () => {
    try {
      if (!eventData.value || !eventData.value.id) {
        $q.notify({ type: 'warning', message: 'Event not loaded yet.' })
        return
      }

      endingEvent.value = true
      const eventRef = doc(db, 'events', eventData.value.id)
      await updateDoc(eventRef, { status: 'ended', updatedAt: new Date() })

      status.value = 'ended'
      eventData.value.status = 'ended'

      $q.notify({ type: 'warning', message: '⚪ Event has ended.' })
    } catch (err) {
      console.error('❌ End Event error:', err)
      $q.notify({ type: 'negative', message: 'Failed to end event. Try again.' })
    } finally {
      endingEvent.value = false
    }
  })
}

/**
 * Navigates back to previous page in browser history
 */
const goBack = () => {
  router.back()
}
</script>

<style scoped>
/**
 * Event Management Page Styles
 * Maintains consistent styling with gradient background and responsive layout
 */

/* =========== temp hiding it
.event-manage-page {
  min-height: 100%;
  background: linear-gradient(180deg, #eef3ff 0%, #ffffff 95%);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  gap: 16px;
}

.page-width {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.full-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}
========================= */
</style>
