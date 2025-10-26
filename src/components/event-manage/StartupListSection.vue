<template>
  <div class="startup-list-section">
    <q-card class="q-pa-md">
      <div class="text-h6 q-mb-md">Startups Management</div>
      
        <!-- Add your startup form/list content here -->
        <div v-if="startups.length === 0" class="text-center q-pa-lg">
            <q-icon name="business_center" size="xl" color="grey" class="q-mb-md" />
            <div class="text-h6 text-grey">No startups added yet</div>
            <div class="text-caption text-grey q-mb-md">
                Start by adding the first startup to your event
            </div>
            <q-btn color="primary" label="Add First Startup" @click="showAddFormToggle" />
        </div>
      
      <div v-else>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">{{ startups.length }} Startup{{ startups.length !== 1 ? 's' : '' }}</div>
        <q-btn 
            color="primary" 
            label="Add Another Startup" 
            @click="showAddForm = true"
            icon="add"
        />
        </div>
        
        <!-- Startups List - VERTICAL STACK OF HORIZONTAL CARDS -->
        <div class="startups-list">
          <div 
            v-for="startup in startups" 
            :key="startup.id"
            class="startup-card"
          >
            <!-- Main Content Section -->
            <div class="startup-content">
              <!-- Startup Name -->
              <div class="startup-name">
                {{ startup.name || 'Unnamed Startup' }}
              </div>
              
              <!-- Startup Description -->
              <div 
                v-if="startup.description" 
                class="startup-description"
              >
                {{ startup.description }}
              </div>
              <div 
                v-else 
                class="startup-no-description"
              >
                No description provided
              </div>
              
              <!-- Founder Email -->
              <div class="startup-email">
                <q-icon name="email" size="sm" />
                <span>{{ startup.founderEmail || 'No email provided' }}</span>
              </div>
            </div>
            
            <!-- Actions Section -->
            <div class="startup-actions">
              <div class="action-buttons">
                <q-btn 
                  round 
                  flat 
                  icon="edit" 
                  size="sm" 
                  color="primary"
                  @click="editStartup(startup)"
                  class="q-mr-xs"
                />
                <q-btn 
                  round 
                  flat 
                  icon="delete" 
                  size="sm" 
                  color="negative"
                  @click="deleteStartup(startup)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Startup Form Section -->
        <div v-if="showEditForm && editingStartup" class="q-mt-lg">
          <q-card class="q-pa-md">
            <div class="text-h6 q-mb-md">Edit Startup</div>
            <startup-form
              :event-id="eventId"
              :startup-data="editingStartup"
              @submit="handleEditSubmit"
              @cancel="showEditForm = false"
            />
          </q-card>
        </div>

        <!-- Add Startup Form Section -->
        <div v-if="showAddForm" class="q-mt-lg">
          <q-card class="q-pa-md">
            <div class="text-h6 q-mb-md">Add New Startup</div>
            <startup-form
              :event-id="eventId"
              @submit="handleFormSubmit"
              @cancel="showAddForm = false"
            />
          </q-card>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup>

import { ref, getCurrentInstance } from 'vue'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import StartupForm from './StartupForm.vue'

// Get Quasar from the current instance instead of useQuasar()
const { proxy } = getCurrentInstance()
const $q = proxy.$q

const props = defineProps({
  startups: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  eventId: String
})


defineEmits(['close', 'add-startup', 'startup-added'])

const showAddForm = ref(false)
const editingStartup = ref(null)
const showEditForm = ref(false)

const handleFormSubmit = () => {
  // Form submission is handled by StartupForm component
  // Just close the form after successful submission
  showAddForm.value = false
  // Optional: emit event to parent if needed
  // emit('add-startup', startupData)
}

const handleEditSubmit = () => {
  showEditForm.value = false
  editingStartup.value = null
}

const editStartup = (startup) => {
  editingStartup.value = { ...startup }
  showEditForm.value = true
}

console.log('Quasar instance available:', !!$q)
console.log('Dialog method available:', $q?.dialog)
console.log('Full $q object:', $q)

const deleteStartup = async (startup) => {
  const confirmed = window.confirm(`Are you sure you want to delete "${startup.name}"? This action cannot be undone.`)
  
  if (!confirmed) return

  try {
    const startupRef = doc(db, 'events', props.eventId, 'startups', startup.id)
    await deleteDoc(startupRef)
    
    // Try to use Quasar notification if available, otherwise use alert
    if ($q && $q.notify) {
      $q.notify({
        type: 'positive',
        message: 'Startup deleted successfully!',
        timeout: 3000
      })
    } else {
      alert('Startup deleted successfully!')
    }
  } catch (error) {
    console.error('Error deleting startup:', error)
    if ($q && $q.notify) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete startup. Please try again.',
        timeout: 3000
      })
    } else {
      alert('Failed to delete startup. Please try again.')
    }
  }
}

const showAddFormToggle = () => {
  console.log('Add button clicked, current showAddForm:', showAddForm.value)
  showAddForm.value = true
  console.log('After setting, showAddForm:', showAddForm.value)
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
  justify-content: space-between;
  padding: 20px;
  min-width: 0; /* Allows text truncation */
}

.startup-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 8px;
  line-height: 1.3;
}

.startup-description {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #424242;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.startup-no-description {
  font-size: 0.8rem;
  color: #9e9e9e;
  font-style: italic;
  margin-bottom: 12px;
}

.startup-email {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #616161;
}

.startup-email .q-icon {
  color: #757575;
}

.startup-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-left: 1px solid #e0e0e0;
  background-color: #fafafa;
  min-width: 100px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Responsive design */
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
  
  .startup-content {
    padding: 16px;
  }
}
</style>