<template>
  <div class="event-info-section">
    <q-card class="q-pa-md">
      <!-- Event details display/edit form will go here -->
      <div v-if="loading" class="text-center">
        <q-spinner size="xl" color="primary" />
        <div class="q-mt-md">Loading event details...</div>
      </div>
      
      <div v-else-if="eventData">
        
        <!-- Display current event info -->
        <q-list class="rounded-borders q-mb-md">
          <q-item>
            <q-item-section>
              <q-item-label caption>Event Name</q-item-label>
              <q-item-label>{{ eventData.name }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label caption>Date</q-item-label>
              <q-item-label>{{ formatDate(eventData.date) }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label caption>Location</q-item-label>
              <q-item-label>{{ eventData.location }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section>
              <q-item-label caption>Capacity</q-item-label>
              <q-item-label>{{ eventData.capacity }} participants</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        
        <!-- Edit button -->
        <div class="row justify-center">
          <q-btn 
            color="primary" 
            label="Edit Event Details" 
            @click="openEdit"
            icon="edit"
          />
        </div>
        
        <!-- Edit form (you'll implement this based on your event creation form) -->
        <q-dialog v-model="editMode" persistent>
          <q-card style="min-width: 400px">
            <q-card-section>
              <div class="text-h6">Edit Event Details</div>
            </q-card-section>
            
        <q-card-section>
        <!-- Event Edit Form -->
        <div class="column q-gutter-md">
            <q-input
            v-model="editFormData.name"
            label="Event Name"
            outlined
            dense
            :rules="[val => !!val || 'Event name is required']"
            />
            <q-input
            v-model="editFormData.date"
            label="Event Date"
            type="date"
            outlined
            dense
            :rules="[val => !!val || 'Date is required']"
            />
            <q-input
            v-model="editFormData.location"
            label="Location"
            outlined
            dense
            :rules="[val => !!val || 'Location is required']"
            />
            <q-input
            v-model="editFormData.capacity"
            label="Capacity"
            type="number"
            outlined
            dense
            :rules="[val => val > 0 || 'Capacity must be greater than 0']"
            />
        </div>
        </q-card-section>
            
            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="primary" @click="editMode = false" />
              <q-btn label="Save Changes" color="primary" :loading="saving" @click="saveChanges" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useQuasar } from 'quasar'


const $q = useQuasar()
const props = defineProps({
  eventData: Object,
  loading: Boolean
})

const editMode = ref(false)
const saving = ref(false)


const emit = defineEmits(['close', 'event-updated'])

// Edit form data - initialize with current event data
const editFormData = reactive({
  name: '',
  date: '',
  location: '',
  capacity: 0
})

// When opening edit mode, populate form with current data
const openEdit = () => {
  editMode.value = true
  // Populate form with current event data
  editFormData.name = props.eventData.name || ''
  editFormData.date = props.eventData.date || ''
  editFormData.location = props.eventData.location || ''
  editFormData.capacity = props.eventData.capacity || 0
}

const formatDate = (dateString) => {
  // Implement your date formatting logic
  return new Date(dateString).toLocaleDateString()
}

const saveChanges = async () => {
  saving.value = true
  try {
    const eventRef = doc(db, 'events', props.eventData.id)
    
    await updateDoc(eventRef, {
      name: editFormData.name.trim(),
      date: editFormData.date,
      location: editFormData.location.trim(),
      capacity: parseInt(editFormData.capacity),
      updatedAt: new Date()
    })

    $q.notify({
      type: 'positive',
      message: 'Event updated successfully!',
      timeout: 3000
    })
    
    editMode.value = false
    emit('event-updated', { 
      name: editFormData.name,
      date: editFormData.date,
      location: editFormData.location,
      capacity: editFormData.capacity
    })
    
  } catch (error) {
    console.error('Error updating event:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update event. Please try again.',
      timeout: 3000
    })
  } finally {
    saving.value = false
  }
}

</script>