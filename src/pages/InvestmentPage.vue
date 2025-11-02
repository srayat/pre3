<template>
<q-page class="q-pa-md">
  <!-- Post-event full-screen message -->
  <div
    v-if="eventStore.currentEvent?.status === 'ended'"
    class="full-screen-message flex flex-center column text-center"
  >
    <div class="text-h5 text-weight-bold q-mb-sm">The event has ended.</div>
    <div class="text-subtitle1">Results will be shortly displayed here.</div>
  </div>

  <!-- Normal content when event is active -->
  <div v-else>
    <!-- Existing content goes here -->
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5 text-weight-bold">
        Investment Portfolio
      </div>
      <q-btn icon="help" round flat color="grey-6" @click="showTutorial = true">
        <q-tooltip>Show Tutorial</q-tooltip>
      </q-btn>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-center">
          <div class="text-h6 q-pr-sm">Your PreMoney Balance:</div>
          <div class="text-h6 text-primary text-weight-bold">
            {{ formatCurrency(userStore.user?.premoney || 0) }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="text-h5 q-mb-md">Available Startups</div>

    <div class="col q-col-gutter-md">
      <div
        v-for="startup in startups"
        :key="startup.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <startup-card
          :startup="startup"
          @invest="handleInvest"
        />
      </div>
    </div>

    <!-- Tutorial dialog -->
    <q-dialog v-model="showTutorial" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
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

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { collection, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useEventStore } from 'stores/event-store'
import { useUserStore } from 'stores/user-store'
import { useRouter } from 'vue-router'
import StartupCard from 'components/StartupCard.vue'
import EventOnboarding from 'components/EventOnboarding.vue'

export default {
  name: 'InvestmentPage',
  components: { StartupCard, EventOnboarding },

  setup() {
    // ======== STATE ========
    const showTutorial = ref(false)
    const startups = ref([])
    const loading = ref(false)
    const error = ref('')
    const unsubscribe = ref(null)

    const eventStore = useEventStore()
    const userStore = useUserStore()
    const router = useRouter()

    // ======== HELPERS ========
    const formatCurrency = (amount) => '$ ' + amount.toLocaleString('en-US')

    const handleInvest = (startupId, amount) => {
      console.log(`Investing ${amount} in startup ${startupId}`)
      // TODO: Add investment logic here
    }

    // ======== MAIN FUNCTION ========
    const loadStartups = async () => {
      const eventId = eventStore.currentEvent?.id
      const eventStatus = eventStore.currentEvent?.status || 'setup'
      if (!eventId) {
        console.warn('No active event found.')
        return
      }

      loading.value = true
      const startupsRef = collection(db, 'events', eventId, 'startups')

      // Helper: merge with root /startups info
      const enrichStartup = async (startupDoc) => {
        const startupId = startupDoc.id
        const eventData = startupDoc.data()
        let rootData = {}
        try {
          const rootSnap = await getDoc(doc(db, 'startups', startupId))
          if (rootSnap.exists()) rootData = rootSnap.data()
        } catch (e) {
          console.error('Error reading root startup', startupId, e)
        }

        return {
          id: startupId,
          name: eventData.name || rootData.name || 'Untitled Startup',
          description: eventData.description || rootData.description || '',
          email: rootData.email || '',
        }
      }

      // ---- Real-time updates for live events ----
      if (eventStatus === 'live') {
        console.log('Event is live — using onSnapshot for real-time updates.')

        unsubscribe.value = onSnapshot(
          startupsRef,
          async (snapshot) => {
            const promises = snapshot.docs.map((doc) => enrichStartup(doc))
            startups.value = await Promise.all(promises)
            loading.value = false
          },
          (err) => {
            console.error('Error with onSnapshot:', err)
            error.value = 'Failed to load startups'
            loading.value = false
          }
        )
      }

      // ---- One-time fetch for ended/setup events ----
      else {
        console.log('Event is not live — fetching startups once.')
        try {
          const snapshot = await getDocs(startupsRef)
          const promises = snapshot.docs.map((doc) => enrichStartup(doc))
          startups.value = await Promise.all(promises)
        } catch (err) {
          console.error('Error fetching startups:', err)
          error.value = 'Failed to load startups'
        } finally {
          loading.value = false
        }
      }
    }

    // ======== LIFECYCLE ========
    onMounted(() => {
      if (!eventStore.currentEvent) {
        router.push('/event-code')
      } else {
        loadStartups()
      }
    })

  // 🔄 WATCHER: Automatically switch from real-time → static after event ends
    watch(
    () => eventStore.currentEvent?.status,
    (newStatus) => {
        if (newStatus === 'ended' && unsubscribe.value) {
        console.log('Event ended — stopping live updates and refetching static data.')
        unsubscribe.value()
        loadStartups()
        }
    }
    )



    onUnmounted(() => {
      if (unsubscribe.value) unsubscribe.value()
    })

    // ======== RETURN TO TEMPLATE ========
    return {
      showTutorial,
      startups,
      loading,
      error,
      eventStore,
      userStore,
      formatCurrency,
      handleInvest,
    }
  },
}
</script>
