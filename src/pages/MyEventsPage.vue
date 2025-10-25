<template>
  <q-page class="my-events-page column q-pa-lg">
    <div class="my-events-content column">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <q-btn flat round icon="arrow_back" color="primary" @click="goBack" />
        <div class="text-h5 text-primary text-weight-bold">My Events</div>
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
            <q-badge align="middle" color="primary" text-color="white" class="role-badge">
              [ {{ event.roleLabel }} ]
            </q-badge>
          </div>

          <div class="text-body2 text-grey-6 q-mt-xs">{{ event.displayDate }}</div>

          <div class="row items-center justify-between q-mt-sm">
            <div class="text-caption text-uppercase text-weight-medium text-grey-7">
              Status: <span :class="statusColorClass(event.status)" class="text-weight-bold">{{
                event.statusLabel
              }}</span>
            </div>
            <q-btn
              :label="event.primaryActionLabel"
              :color="event.primaryActionColor"
              size="sm"
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, collectionGroup, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const events = ref([])
const loading = ref(true)

const STATUS_LABELS = {
  draft: 'Draft',
  live: 'Live',
  ended: 'Ended',
}

const ROLE_LABELS = {
  host: 'Host',
  startup: 'Startup',
  investor: 'Investor',
  judge: 'Judge',
}

function statusColorClass(status) {
  if (status === 'live') return 'text-positive'
  if (status === 'draft') return 'text-warning'
  if (status === 'ended') return 'text-negative'
  return 'text-grey-6'
}

function goBack() {
  router.back()
}

async function fetchEvents() {
  const user = auth.currentUser
  if (!user) {
    loading.value = false
    router.replace('/sign-in')
    return
  }

  try {
    const eventsList = []
    const eventCache = new Map()
    const seen = new Set()

    async function addEventWithRole(eventId, role) {
      const key = `${eventId}-${role}`
      if (seen.has(key)) {
        return
      }

      let data = eventCache.get(eventId)
      if (!data) {
        const eventDoc = await getDoc(doc(db, 'events', eventId))
        if (!eventDoc.exists()) {
          return
        }
        data = eventDoc.data()
        eventCache.set(eventId, data)
      }

      eventsList.push(buildEventEntry(eventId, data, role))
      seen.add(key)
    }

    const hostQuery = query(collection(db, 'events'), where('hostUid', '==', user.uid))
    const hostedSnap = await getDocs(hostQuery)

    for (const docSnap of hostedSnap.docs) {
      const data = docSnap.data()
      const eventId = docSnap.id

      eventCache.set(eventId, data)
      await addEventWithRole(eventId, 'host')
    }

    const rolesToCheck = [
      { role: 'startup', path: 'startups' },
      { role: 'judge', path: 'judges' },
    ]

    for (const { role, path } of rolesToCheck) {
      const roleQuery = query(collectionGroup(db, path), where('linkedUid', '==', user.uid))
      const roleSnap = await getDocs(roleQuery)

      for (const roleDoc of roleSnap.docs) {
        const eventRef = roleDoc.ref.parent?.parent
        if (!eventRef) {
          continue
        }
        await addEventWithRole(eventRef.id, role)
      }
    }

    events.value = eventsList.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Unable to load events. Please try again.' })
  } finally {
    loading.value = false
  }
}

function buildEventEntry(id, data, role) {
  const status = data.status || 'draft'
  return {
    id,
    name: data.name || 'Untitled Event',
    status,
    statusLabel: STATUS_LABELS[status] || status,
    role,
    roleLabel: ROLE_LABELS[role] || role,
    hostUid: data.hostUid,
    date: data.date || null,
    displayDate: data.date ? new Date(data.date).toLocaleDateString() : 'Date TBD',
    primaryActionLabel: computePrimaryLabel(status, role),
    primaryActionColor: computePrimaryColor(status, role),
    updatedAt: data.updatedAt?.toMillis?.() || 0,
  }
}

function computePrimaryLabel(status, role) {
  if (status === 'ended') return 'View'
  if (status === 'live') {
    return role === 'host' ? 'Monitor' : 'Join'
  }
  if (status === 'draft') {
    return role === 'host' ? 'Continue Setup' : 'Awaiting Host'
  }
  return 'Open'
}

function computePrimaryColor(status, role) {
  if (status === 'ended') return 'primary'
  if (status === 'live') return role === 'host' ? 'warning' : 'positive'
  if (status === 'draft') return role === 'host' ? 'primary' : 'grey-6'
  return 'primary'
}

function handlePrimaryAction(event) {
  if (event.status === 'ended') {
    router.push({ path: `/events/${event.id}`, query: { mode: 'view' } })
    return
  }

  if (event.status === 'draft' && event.role === 'host') {
    router.push(`/events/${event.id}`)
    return
  }

  if (event.status === 'live') {
    if (event.role === 'host') {
      router.push({ path: `/events/${event.id}`, query: { mode: 'monitor' } })
    } else {
      router.push({ path: `/events/${event.id}`, query: { mode: 'join' } })
    }
    return
  }

  router.push(`/events/${event.id}`)
}

onMounted(fetchEvents)
</script>

<style scoped>
.my-events-page {
  min-height: 100%;
  background: linear-gradient(180deg, #f1f5ff 0%, #ffffff 90%);
  overflow: hidden;
  padding-bottom: 100px;
}

.my-events-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.event-card,
.skeleton-card {
  border-radius: 4px;
  box-shadow: 0 18px 32px rgba(15, 35, 95, 0.08);
  padding: 18px;
  width: 100%;
}

.empty-state {
  border-radius: 18px;
  background: rgba(48, 113, 198, 0.08);
  padding: 36px 24px;
}

.event-name {
  color: var( --app-mifnight-blue ) !important;
}

:deep(.role-badge) {
  font-weight: 600;
  font-size: 1em;
  letter-spacing: 0.05em;
  background: none !important;
  color: #444 !important;
}

.q-btn {
  color: var( --app-midnight-blue ) !important;
  font-size: 0.9em !important;
  background: var( --app-harper-blue) !important;
}

.q-btn:hover {
  background: var( --app-light-steel-3) !important;
}

</style>
