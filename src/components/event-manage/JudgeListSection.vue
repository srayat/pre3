<template>
  <div class="judge-list-section">
    <q-card class="q-pa-md">
      <div class="text-h6 q-mb-md">Judges Management</div>
      
      <!-- Empty state -->
      <div v-if="judges.length === 0" class="text-center q-pa-lg">
        <q-icon name="gavel" size="xl" color="grey" class="q-mb-md" />
        <div class="text-h6 text-grey">No judges added yet</div>
        <div class="text-caption text-grey q-mb-md">
          Start by adding the first judge to your event
        </div>
        <q-btn color="primary" label="Add First Judge" @click="showAddForm = true" />
      </div>
      
      <div v-else>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">{{ judges.length }} Judge{{ judges.length !== 1 ? 's' : '' }}</div>
          <q-btn 
            color="primary" 
            label="Add Another Judge" 
            @click="showAddForm = true"
            icon="add"
          />
        </div>
        
        <!-- Judges List -->
        <div class="judges-list">
          <div 
            v-for="judge in judges" 
            :key="judge.id"
            class="judge-card"
          >
            <!-- Main Content Section -->
            <div class="judge-content">
              <!-- Judge Name -->
              <div class="judge-name">
                {{ judge.name || 'Unnamed Judge' }}
              </div>
              
              <!-- Judge Email -->
              <div class="judge-email">
                <q-icon name="email" size="sm" />
                <span>{{ judge.email || 'No email provided' }}</span>
              </div>
            </div>
            
            <!-- Actions Section -->
            <div class="judge-actions">
              <div class="action-buttons">
                <q-btn 
                  round 
                  flat 
                  icon="edit" 
                  size="sm" 
                  color="primary"
                  @click="editJudge(judge)"
                  class="q-mr-xs"
                />
                <q-btn 
                  round 
                  flat 
                  icon="delete" 
                  size="sm" 
                  color="negative"
                  @click="deleteJudge(judge)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Next action button -->
        <div v-if="judges.length > 0" class="next-action q-mt-lg">
          <q-btn
            color="primary"
            outline
            no-caps
            class="q-py-sm full-width"
            icon="quiz"
            label="Configure Rating Questions Next"
            @click="$emit('open-section', 'rating')"
          />
        </div>
      
            <!-- Edit Judge Form Section -->
        <div v-if="showEditForm && editingJudge" class="q-mt-lg">
          <q-card class="q-pa-md">
            <div class="text-h6 q-mb-md">Edit Judge</div>
            <judge-form
              :event-id="eventId"
              :judge-data="editingJudge"
              @submit="handleEditSubmit"
              @cancel="showEditForm = false"
            />
          </q-card>
        </div>  
        
    </div>
    </q-card>
    



    <!-- Add Judge Form Section -->
    <div v-if="showAddForm" class="q-mt-lg">
      <q-card class="q-pa-md">
        <div class="text-h6 q-mb-md">Add New Judge</div>
        <JudgeForm
          :event-id="eventId"
          @submit="handleFormSubmit"
          @cancel="showAddForm = false"
        />
      </q-card>
    </div>
  </div>
</template>


<script setup>
import { ref, getCurrentInstance } from 'vue'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import JudgeForm from './JudgeForm.vue'

// Get Quasar from the current instance
const { proxy } = getCurrentInstance()
const $q = proxy.$q

const props = defineProps({
  judges: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  eventId: String
})

defineEmits(['close', 'open-section', 'add-judge'])

const showAddForm = ref(false)
const editingJudge = ref(null)
const showEditForm = ref(false)

const handleFormSubmit = () => {
  showAddForm.value = false
}

const handleEditSubmit = () => {
  showEditForm.value = false
  editingJudge.value = null
}

const editJudge = (judge) => {
  editingJudge.value = { ...judge }
  showEditForm.value = true
}

const deleteJudge = async (judge) => {
  const confirmed = window.confirm(`Are you sure you want to delete "${judge.name}"? This action cannot be undone.`)
  
  if (!confirmed) return

  try {
    const judgeRef = doc(db, 'events', props.eventId, 'judges', judge.id)
    await deleteDoc(judgeRef)
    
    if ($q && $q.notify) {
      $q.notify({
        type: 'positive',
        message: 'Judge deleted successfully!',
        timeout: 3000
      })
    } else {
      alert('Judge deleted successfully!')
    }
  } catch (error) {
    console.error('Error deleting judge:', error)
    if ($q && $q.notify) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete judge. Please try again.',
        timeout: 3000
      })
    } else {
      alert('Failed to delete judge. Please try again.')
    }
  }
}
</script>


<style scoped>
.judges-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.judge-card {
  display: flex;
  align-items: stretch;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  min-height: 100px;
}

.judge-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #2196f3;
}

.judge-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  min-width: 0;
}

.judge-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 8px;
  line-height: 1.3;
}

.judge-email {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #616161;
}

.judge-email .q-icon {
  color: #757575;
}

.judge-actions {
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
  .judge-card {
    flex-direction: column;
  }
  
  .judge-actions {
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
  
  .judge-content {
    padding: 16px;
  }
}
</style>