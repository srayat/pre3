<template>
  <q-page class="q-pa-md">
    <!-- 🌀 Loading State -->
    <div
      v-if="eventStatus === 'loading'"
      class="flex flex-center column q-mt-xl text-center"
      style="min-height: 60vh"
    >
      <q-spinner size="48px" color="primary" />
      <div class="text-subtitle1 q-mt-md text-grey-7">Loading event data...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-center column q-mt-xl text-center">
      <q-icon name="error" size="48px" color="negative" class="q-mb-md" />
      <div class="text-h6 text-negative q-mb-sm">{{ error }}</div>
      <q-btn color="primary" label="Go Home" @click="$router.push('/home')" />
    </div>

    <!-- Event ended -->
    <div
      v-else-if="eventStatus === 'ended'"
      class="full-screen-message flex flex-center column text-center"
    >
      <div class="text-h5 text-weight-bold q-mb-sm">The event has ended.</div>
      <div class="text-subtitle1">Results will be available soon.</div>
    </div>

    <!-- Event live -->
    <div v-else-if="eventStatus === 'live'">
      <div class="row justify-between items-center q-mb-md q-mt-xl">
        <q-btn icon="arrow_back" flat round @click="$router.push('/home')" />
        <div class="text-h5 text-weight-bold">Investment Portfolio</div>
        <q-btn icon="help" round flat color="grey-6" @click="showTutorial = true">
          <q-tooltip>Show Tutorial</q-tooltip>
        </q-btn>
      </div>

      <!-- 🧠 PreMoney Account Summary -->
      <q-card class="q-pa-lg gradient-card text-white text-center q-mb-xl">
        <div class="text-subtitle1 text-weight-bold row flex-center">
          Your PreMoney Fund for the Event: {{ Number(totalAllocated ?? 0).toFixed(0) }}
        </div>

        <div class="row justify-around q-mt-md">
          <div>
            <div class="text-overline text-orange text-weight-bold">Invested</div>
            <div class="text-h5 text-orange text-center text-weight-bold">
              {{ totalAllocated - remainingBalance }}
            </div>
          </div>
          <div>
            <div class="text-overline text-center text-weight-bold">Balance</div>
            <div class="text-h5 text-grey-1 text-center text-weight-bold">
              {{ Number(remainingBalance ?? 0).toFixed(0) }}
            </div>
          </div>
        </div>

        <div class="progress-bar q-mt-md bg-grey-5 no-border-radius">
          <div
            class="progress-fill bg-orange"
            :style="{ width: ((totalAllocated - remainingBalance) / totalAllocated) * 100 + '%' }"
          ></div>
        </div>
      </q-card>

      <!-- 🧠 Loading startups -->
      <div v-if="loading" class="flex flex-center column q-my-xl text-grey-7">
        <q-spinner size="32px" color="primary" />
        <div class="q-mt-sm">Loading startups...</div>
      </div>

      <div v-else-if="startups.length === 0" class="text-center q-my-xl text-grey-7">
        <q-icon name="corporate_fare" size="48px" color="grey-5" class="q-mb-md" />
        <div class="text-h6">No startups available yet</div>
        <div class="text-body2 q-mt-sm">
          Check back later when startups are added to this event.
        </div>
      </div>

      <div v-else class="col q-col-gutter-md">
        <div v-for="startup in startups" :key="startup.id" class="col-12">
          <startup-card
            :startup="startup"
            :invested="investments[startup.id] || 0"
            :disabled="!isLive"
            :event-id="eventId"
            :is-rated="isStartupRated(startup.id)"
            @update-investment="(amount) => updateInvestment(startup.id, amount, isLive)"
          />
        </div>
      </div>

      <!-- Tutorial dialog -->
      <q-dialog v-model="showTutorial" persistent>
        <q-card style="width: 700px; max-width: 80vw">
          <q-card-section class="row items-center">
            <div class="text-h6">Event Tutorial</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <event-onboarding :embedded="true" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Close" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, collection, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from 'boot/firebase'
import StartupCard from 'components/StartupCard.vue'
import EventOnboarding from 'components/EventOnboarding.vue'
import { useInvestments } from 'src/composables/useInvestments'
import { useRatings } from 'src/composables/useRatings'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const eventId = computed(() => route.params.eventId)

const showTutorial = ref(false)
const startups = ref([])
const eventStatus = ref('loading')
const eventData = ref(null)
const loading = ref(false)
const error = ref('')
const unsubscribe = ref(null)
const { ratedStartups } = useRatings(eventId)
const isStartupRated = (startupId) => {
  return ratedStartups.value?.has(startupId) || false
}

// 🔹 Load investment composable (pass eventId directly)
const { totalAllocated, investments, remainingBalance, updateInvestment } = useInvestments(eventId)

// 🔹 Event status check
const isLive = computed(() => eventData.value?.status === 'live')

// 🔹 Fetch event details
async function loadEvent() {
  if (!eventId.value) {
    router.push('/home')
    return
  }

  try {
    eventStatus.value = 'loading'
    error.value = ''

    const eventRef = doc(db, 'events', eventId.value)
    const snap = await getDoc(eventRef)

    if (!snap.exists()) {
      error.value = 'Event not found'
      $q.notify({
        type: 'negative',
        message: 'No event found for this code.',
        timeout: 3000,
      })
      setTimeout(() => router.replace('/home'), 2000)
      return
    }

    const data = snap.data()
    eventData.value = { id: eventId.value, ...data }
    eventStatus.value = data.status || 'setup'

    // Store in localStorage (fixed - store the value, not the ref)
    localStorage.setItem('currentEventId', eventId.value)

    // 🚦 Handle status
    if (data.status === 'setup') {
      error.value = 'Event is not live yet'
      $q.notify({
        type: 'warning',
        message: 'This event is still in setup. Check back later.',
        timeout: 3000,
      })
      setTimeout(() => router.replace('/home'), 2000)
      return
    }

    if (data.status === 'ended') {
      console.log('Event ended — showing static data')
      await loadStartups(eventId.value, 'ended')
      return
    }

    if (data.status === 'live') {
      await loadStartups(eventId.value, 'live')
    }
  } catch (err) {
    console.error('❌ Error loading event:', err)
    error.value = 'Failed to load event data'
    $q.notify({
      type: 'negative',
      message: 'Something went wrong while loading the event.',
      timeout: 3000,
    })
  }
}

// 🔹 Load startups from Firestore
async function loadStartups(eventIdParam, status) {
  const startupsRef = collection(db, 'events', eventIdParam, 'startups')
  loading.value = true

  if (status === 'live') {
    console.log('Event is live — using onSnapshot for startups')
    unsubscribe.value = onSnapshot(
      startupsRef,
      (snapshot) => {
        startups.value = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        loading.value = false
      },
      (err) => {
        console.error('❌ Error with onSnapshot:', err)
        error.value = 'Failed to load startups'
        loading.value = false
      },
    )
  } else {
    console.log('Event not live — one-time fetch')
    try {
      const snap = await getDocs(startupsRef)
      startups.value = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    } catch (err) {
      console.error('❌ Error fetching startups:', err)
      error.value = 'Failed to load startups'
    } finally {
      loading.value = false
    }
  }
}

// 🔄 Lifecycle
onMounted(loadEvent)

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
    unsubscribe.value = null
  }
})

// 🔁 Watch event status
watch(eventStatus, (newVal) => {
  if (newVal === 'ended' && unsubscribe.value) {
    unsubscribe.value()
    unsubscribe.value = null
    console.log('Stopped live updates after event ended')
  }
})
</script>

<style scoped>
.full-screen-message {
  height: 80vh;
  color: #555;
}

.progress-bar {
  width: 100%;
  height: 8px;
}
.progress-fill {
  height: 8px;
  zbackground: #ffd54f;
}

.gradient-card {
  background: #060421;
  background: linear-gradient(
    148deg,
    rgba(6, 4, 33, 1) 0%,
    rgba(12, 12, 105, 1) 57%,
    rgba(21, 121, 179, 1) 100%
  );
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}
</style>
