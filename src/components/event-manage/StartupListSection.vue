<template>
  <div class="startup-list-section">
    <q-card class="q-pa-md">
      <div class="text-h6 q-mb-md">Founder Invitations</div>

      <!-- No invites yet -->
      <div v-if="invites.length === 0" class="text-center q-pa-lg">
        <q-icon name="email" size="xl" color="grey" class="q-mb-md" />
        <div class="text-h6 text-grey">No invitations sent yet</div>
        <div class="text-caption text-grey q-mb-md">
          Start by sending your first founder invite
        </div>
        <q-btn color="primary" label="Send First Invite" @click="showAddForm = true" />
      </div>

      <!-- Invite List -->
      <div v-else>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">
            {{ invites.length }} Invite{{ invites.length !== 1 ? 's' : '' }}
          </div>
          <q-btn 
            color="primary" 
            label="Send Another Invite" 
            @click="showAddForm = true"
            icon="add"
          />
        </div>

        <!-- Invitation Cards -->
        <div class="startups-list">
          <div
            v-for="invite in invites"
            :key="invite.id"
            class="startup-card"
          >
            <!-- Email + Status -->
            <div class="startup-content">
              <div class="startup-email">
                <q-icon name="email" size="sm" />
                <span class="text-body1">{{ invite.founderEmail }}</span>
              </div>

              <div class="q-mt-sm">
                <q-badge :color="statusColor(invite.status)">
                  {{ STATUS_LABELS[invite.status] || 'Unknown' }}
                </q-badge>
              </div>

              <div class="q-mt-sm text-caption text-grey">
                Invite Sent: 
                <strong>
                  {{ formatTimestamp(invite.updatedAt) }}
                </strong>
              </div>
            </div>

            <!-- Actions -->
            <div class="startup-actions">
              <div class="action-buttons">
                <q-btn
                  round
                  flat
                  icon="delete"
                  size="sm"
                  color="negative"
                  @click="deleteInvite(invite)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Founder Invite Form - MOVED OUTSIDE -->
      <div v-if="showAddForm" class="q-mt-lg">
        <q-card class="q-pa-md">
          <div class="text-h6 q-mb-md">Send Founder Invite</div>
          <add-founder-invite-form
            :event-id="eventId"
            @submit="handleInviteSubmit"
            @cancel="showAddForm = false"
          />
        </q-card>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'boot/firebase'
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import AddFounderInviteForm from './AddFounderInviteForm.vue'

const $q = useQuasar()

const props = defineProps({
  eventId: { type: String, required: true }
})

// 🔹 Local reactive state
const invites = ref([])
const showAddForm = ref(false)

// 🔹 Status mapping (internal → display)
const STATUS_LABELS = {
  pending_claim: 'Awaiting Response',
  claimed: 'Confirmed',
  declined: 'Declined',
  expired: 'Expired',
  revoked: 'Revoked'
}

// 🔹 Status badge color mapping
function statusColor(status) {
  switch (status) {
    case 'claimed':
      return 'positive'
    case 'declined':
      return 'negative'
    case 'pending_claim':
      return 'warning'
    default:
      return 'grey'
  }
}

// 🔹 Timestamp formatter
function formatTimestamp(ts) {
  if (!ts) return '—'
  if (ts.toDate) ts = ts.toDate()
  return new Date(ts).toLocaleString()
}

// 🔹 Firestore listener for invites
onMounted(() => {
  const colRef = collection(db, 'events', props.eventId, 'startups')
  onSnapshot(colRef, snap => {
    invites.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

// 🔹 Handle new invite submission
const handleInviteSubmit = () => {
  showAddForm.value = false
  $q.notify({ type: 'positive', message: 'Invite sent successfully!' })
}

// 🔹 Delete invite
const deleteInvite = async (invite) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete the invite for "${invite.founderEmail}"?`
  )
  if (!confirmed) return

  try {
    await deleteDoc(doc(db, 'events', props.eventId, 'startups', invite.id))
    $q.notify({ type: 'positive', message: 'Invite deleted.' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Failed to delete invite.' })
  }
}
</script>

<style scoped>
.startups-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.startup-card {
  display: flex;
  align-items: stretch;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  min-height: 120px;
}

.startup-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #2196f3;
}

.startup-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}

.startup-email {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;
  color: #333;
}

.startup-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-left: 1px solid #e0e0e0;
  background-color: #fafafa;
  min-width: 80px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 600px) {
  .startup-card {
    flex-direction: column;
  }
  .startup-actions {
    border-left: none;
    border-top: 1px solid #e0e0e0;
    min-width: auto;
    padding: 12px 20px;
  }
  .action-buttons {
    flex-direction: row;
    justify-content: center;
    gap: 16px;
  }
}
</style>
