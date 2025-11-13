<template>
  <div class="event-management">
    <!-- Conditional rendering: Either show setup steps OR active section -->
    <div v-if="!activeSection" class="management-content">
      <setup-steps
        :loading="eventLoading"
        :recently-created="false"
        :event-data="eventData"
        :startup-count="startups.length"
        :judge-count="judges.length"
        :rating-questions-enabled="eventData?.ratingQuestionsEnabled"
        @open-section="openSection"
      />
    </div>

    <!-- Full-width sections when active -->
    <div v-else class="full-section">
      <!-- Section header with back button -->
      <div class="row justify-between items-center q-mb-md">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="handleCloseSection"
          class="q-mr-sm"
        />
        <div class="text-h5 text-weight-bold text-primary">
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
      />

      <startup-list-section
        v-else-if="activeSection === 'startup'"
        :startups="startups"
        :loading="inviteLoading.startup"
        :event-id="eventId"
        @close="handleCloseSection"
        @add-startup="submitStartup"
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
      <!-- SETUP STATUS -->
      <q-card v-if="eventData.status === 'setup'" class="q-pa-md q-mt-lg shadow-1 bg-grey-2">
        <div class="column items-center q-gutter-md">
          <q-icon name="build_circle" size="48px" color="primary" />
          <div class="text-h6 text-weight-bold">Event in Setup</div>
          <div class="text-body2 text-grey-7 text-center q-mb-md">
            Complete your setup and click below when you're ready to go live.
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

      <!-- LIVE STATUS -->
      <q-card
        v-else-if="eventData.status === 'live'"
        class="q-mt-lg q-pa-lg bg-grey-2 text-positive text-center"
        flat
        style="border: 2px solid #2e7d32"
      >
        <div class="text-h6 text-weight-bold">✅ Event is now Live</div>
        <div class="text-subtitle1 text-grey-8 q-mb-md">
          Attendees can join and invest PreMoney in startups.
        </div>

        <div class="q-mt-md">
          <q-btn
            color="negative"
            label="End Event"
            icon="stop_circle"
            unelevated
            :loading="endingEvent"
            @click="confirmEndEvent"
            class="q-px-lg"
            style="min-width: 200px"
          />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { doc, updateDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from 'boot/firebase'

// ✅ Updated import paths based on your folder structure
import SetupSteps from './event-manage/SetupSteps.vue'
import EventInfoSection from './event-manage/EventInfoSection.vue'
import StartupListSection from './event-manage/StartupListSection.vue'
import JudgeListSection from './event-manage/JudgeListSection.vue'
import RatingQuestionsSection from './event-manage/RatingQuestionsSection.vue'

const props = defineProps({
  eventId: {
    type: String,
    required: true,
  },
  eventData: {
    type: Object,
    required: true,
  },
})

const $q = useQuasar()

// State
const eventLoading = ref(false)
const startups = ref([])
const judges = ref([])
const activeSection = ref(null)
const goingLive = ref(false)
const endingEvent = ref(false)

const inviteLoading = reactive({
  startup: false,
  judge: false,
})

// Firestore unsubscribe functions
let unsubscribeStartups = null
let unsubscribeJudges = null

// Section management
const getSectionTitle = (section) => {
  const titles = {
    'event-info': 'Event Information',
    startup: 'Manage Startups',
    judge: 'Manage Judges',
    rating: 'Configure Rating Questions',
  }
  return titles[section] || 'Manage Section'
}

const handleCloseSection = () => {
  activeSection.value = null
}

const openSection = (section) => {
  activeSection.value = section
}

const handleEventUpdated = () => {
  $q.notify({
    type: 'positive',
    message: 'Event updated successfully!',
    timeout: 2000,
  })
}

const submitStartup = async (startupData) => {
  console.log('Startup submission:', startupData)
}

const submitJudge = async (judgeData) => {
  console.log('Judge submission:', judgeData)
}

// Setup real-time listeners
const setupRealtimeListeners = () => {
  // Startups listener
  const startupsRef = collection(db, 'events', props.eventId, 'startups')
  const startupsQuery = query(startupsRef, orderBy('createdAt', 'desc'))

  unsubscribeStartups = onSnapshot(
    startupsQuery,
    (snapshot) => {
      startups.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log('✅ Startups updated:', startups.value.length)
    },
    (error) => {
      console.error('❌ Error loading startups:', error)
    },
  )

  // Judges listener
  const judgesRef = collection(db, 'events', props.eventId, 'judges')
  const judgesQuery = query(judgesRef, orderBy('createdAt', 'desc'))

  unsubscribeJudges = onSnapshot(
    judgesQuery,
    (snapshot) => {
      judges.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log('✅ Judges updated:', judges.value.length)
    },
    (error) => {
      console.error('❌ Error loading judges:', error)
    },
  )
}

// Go Live
async function confirmGoLive() {
  $q.dialog({
    title: 'Go Live',
    message: 'Make this event live? Attendees will be able to join and invest.',
    cancel: { label: 'Cancel', flat: true, color: 'grey' },
    ok: { label: 'Yes, Go Live', color: 'positive', icon: 'rocket_launch' },
    persistent: true,
  }).onOk(async () => {
    try {
      goingLive.value = true
      const eventRef = doc(db, 'events', props.eventId)
      await updateDoc(eventRef, { status: 'live', updatedAt: new Date() })

      $q.notify({ type: 'positive', message: '🚀 Event is now live!' })
    } catch (err) {
      console.error('❌ Go Live error:', err)
      $q.notify({ type: 'negative', message: 'Failed to go live. Try again.' })
    } finally {
      goingLive.value = false
    }
  })
}

// End Event
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
      endingEvent.value = true
      const eventRef = doc(db, 'events', props.eventId)
      await updateDoc(eventRef, { status: 'ended', updatedAt: new Date() })

      $q.notify({ type: 'info', message: 'Event has ended.' })
    } catch (err) {
      console.error('❌ End Event error:', err)
      $q.notify({ type: 'negative', message: 'Failed to end event. Try again.' })
    } finally {
      endingEvent.value = false
    }
  })
}

// Lifecycle
onMounted(() => {
  console.log('🚀 EventManagement mounted for event:', props.eventId)
  setupRealtimeListeners()
})

onUnmounted(() => {
  console.log('🛑 EventManagement unmounted, cleaning up listeners')
  if (unsubscribeStartups) unsubscribeStartups()
  if (unsubscribeJudges) unsubscribeJudges()
})
</script>

<style scoped>
.event-management {
  width: 100%;
}

.management-content {
  width: 100%;
}

.full-section {
  width: 100%;
}
</style>
