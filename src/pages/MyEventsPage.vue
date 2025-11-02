<template>
  <q-page class="my-events-page column q-pa-lg">
    <div class="my-events-content column">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold q-pt-lg">My Events</div>
      </div>

      <div class="text-body1 text-grey-7 q-mb-md">
        Events you host or participate in. Tap any card to dive in.
      </div>

      <q-card v-if="loading" flat bordered class="skeleton-card">
        <q-skeleton type="QBadge" width="120px" />
        <q-skeleton type="text" class="q-mt-sm" />
        <q-skeleton type="rect" class="q-mt-sm" height="32px" />
      </q-card>

      <div v-else class="events-list column">
        <div v-if="events.length === 0" class="empty-state column items-center justify-center">
          <q-icon name="event_busy" size="48px" color="primary" class="q-mb-sm" />
          <div class="text-subtitle1 text-weight-medium text-primary">No events yet</div>
          <div class="text-body2 text-grey-7 text-center q-mt-xs">
            Once you participate in or host an event, it will appear here.
          </div>
        </div>

        <!-- ✅ Event Cards -->
        <q-card
          v-for="event in events"
          :key="event.id"
          flat
          bordered
          class="event-card"
          @click="handlePrimaryAction(event)"
        >
          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold text-primary event-name">
              {{ event.name }}
            </div>
            <q-badge align="middle" class="role-badge text-body2 text-grey-8 bg-transparent">
              [ {{ event.roleLabel }} ]
            </q-badge>
          </div>

          <div class="text-body2 text-grey-8 q-mt-xs q-mb-md">
            Event Date: {{ event.displayDate }}
          </div>

          <div class="row items-center justify-between q-mt-sm">
            <div class="text-caption text-uppercase text-weight-medium text-grey-8">
              Event Status:
              <span :class="statusColorClass(event.status)" class="text-weight-bold">
                {{ event.statusLabel }}
              </span>
            </div>
            <q-btn
              :label="event.primaryActionLabel || 'Manage'"
              :color="event.primaryActionColor || 'primary'"
              class="text-body2 q-py-sm"
              no-caps
              unelevated
              @click.stop="handlePrimaryAction(event)"
            />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const events = ref([])
const loading = ref(true)

function statusColorClass(status) {
  if (status === 'live') return 'text-positive'
  if (status === 'draft' || status === 'setup') return 'text-warning'
  if (status === 'ended') return 'text-negative'
  return 'text-grey-6'
}

async function fetchEvents(uid) {
  try {
    const hostedRef = collection(db, `users/${uid}/hostedEvents`)
    const hostedSnap = await getDocs(hostedRef)
    const eventsList = []

    for (const hostedDoc of hostedSnap.docs) {
      const eventId = hostedDoc.id
      const eventRef = doc(db, 'events', eventId)
      const eventSnap = await getDoc(eventRef)
      if (eventSnap.exists()) {
        const data = eventSnap.data()
        eventsList.push({
          id: eventId,
          name: data.name || 'Untitled Event',
          status: data.status || 'setup',
          statusLabel: data.status || 'Setup',
          roleLabel: 'Host',
          displayDate: data.date
            ? new Date(data.date).toLocaleDateString()
            : 'Date TBD',
        })
      }
    }

    events.value = eventsList
  } catch (error) {
    console.error('Error fetching events:', error)
    $q.notify({ type: 'negative', message: 'Unable to load events.' })
  } finally {
    loading.value = false
  }
}

function handlePrimaryAction(event) {
  if (!event || !event.id) return
  router.push(`/events/${event.id}`)
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) fetchEvents(user.uid)
    else router.replace('/sign-in')
  })
})
</script>

<style scoped>
.my-events-page {
  min-height: 100%;
  background: linear-gradient(180deg, #f1f5ff 0%, #ffffff 90%);
  overflow: hidden;
  padding-bottom: 100px;
}
.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.event-card {
  border-radius: 4px;
  box-shadow: 0 18px 32px rgba(15, 35, 95, 0.08);
  padding: 18px;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}
.event-card:hover {
  box-shadow: 0 18px 40px rgba(15, 35, 95, 0.15);
  background: #f1f1f1;
}
</style>
