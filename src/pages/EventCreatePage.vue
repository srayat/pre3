<template>
  <q-page class="event-create-page column q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="primary" @click="goBack" />
      <div class="text-h5 text-weight-bold text-primary q-ml-sm">Create an Event</div>
    </div>

    <div class="text-body1 text-grey-7 q-mb-lg">
      Share a few details to spin up your pitch event. You can invite founders and judges after
      saving.
    </div>


    <!-- Stepper -->
    <q-stepper
      v-model="currentStep"
      vertical
      color="primary"
      animated
      class="q-mb-lg"
    >
      <!-- Step 1: Basic Info -->
      <q-step
        :name="1"
        title="Basic Information"
        icon="info"
        :done="currentStep > 1"
      >
        <event-basic-info 
          :form-data="form" 
          :loading="loading" 
          @update:form-data="updateForm"
        />
        
        <q-stepper-navigation class="q-mt-md">
          <q-btn 
            @click="currentStep = 2" 
            color="primary" 
            label="Continue" 
            :disable="!form.name"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: Settings -->
      <q-step
        :name="2"
        title="Event Settings"
        icon="settings"
        :done="currentStep > 2"
      >
        <event-settings 
          :form-data="form" 
          :loading="loading" 
          @update:form-data="updateForm"
        />
        
        <q-stepper-navigation class="q-mt-md">
          <q-btn 
            flat 
            @click="currentStep = 1" 
            color="primary" 
            label="Back" 
            class="q-mr-sm" 
          />
          <q-btn 
            @click="currentStep = 3" 
            color="primary" 
            label="Continue" 
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 3: Preview & Create -->
      <q-step
        :name="3"
        title="Preview & Create"
        icon="preview"
      >
        <event-preview :form-data="form" />
        
        <q-stepper-navigation class="q-mt-md">
          <q-btn 
            flat 
            @click="currentStep = 2" 
            color="primary" 
            label="Back" 
            class="q-mr-sm" 
          />
          <q-btn 
            @click="handleSubmit" 
            color="positive" 
            label="Create Event" 
            :loading="loading"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>


    <q-separator class="q-mt-lg" />

    <div class="text-caption text-grey-6 q-mt-md">
      After creating an event, you will be able to invite startup founders and judges using their
      email addresses.
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'

// Components
import EventBasicInfo from 'components/event-create/EventBasicInfo.vue'
import EventSettings from 'components/event-create/EventSettings.vue'
import EventPreview from 'components/event-create/EventPreview.vue'

const router = useRouter()
const $q = useQuasar()
const loading = ref(false)
const currentStep = ref(1)

const form = reactive({
  name: '',
  description: '',
  date: '',
  location: '',
  capacity: null,
  isPublic: true
})

// This function to handle form updates from child components
const updateForm = (newFormData) => {
  Object.assign(form, newFormData)
}


// Generate 5-digit numeric event code (10000-99999)
const generateEventCode = () => {
  const min = 10000
  const max = 99999
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate unique numeric code with collision detection
const generateUniqueEventCode = async () => {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const code = generateEventCode().toString() // Convert to string for Firestore ID
    const eventRef = doc(db, 'events', code)
    
    try {
      // Check if code already exists
      const eventSnap = await getDoc(eventRef)
      if (!eventSnap.exists()) {
        return code // Unique code found!
      }
    } catch (error) {
      console.error('Error checking event code:', error)
    }
    
    attempts++
  }
  
  throw new Error('Could not generate unique event code after multiple attempts')
}

function goBack() {
  router.back()
}

async function handleSubmit() {
  if (!auth.currentUser) {
    $q.notify({ type: 'negative', message: 'You must be signed in to create an event.' })
    await router.replace('/sign-in')
    return
  }

  if (!form.name.trim()) {
    $q.notify({ type: 'warning', message: 'Event name is required.' })
    currentStep.value = 1
    return
  }

  try {
    loading.value = true
    
    // Generate unique 5-digit numeric event code
    const eventCode = await generateUniqueEventCode()
    
    // Create event with numeric code as document ID
    const eventRef = doc(db, 'events', eventCode)
    const timestamp = serverTimestamp()

    await setDoc(eventRef, {
      name: form.name.trim(),
      description: form.description.trim(),
      date: form.date || null,
      location: form.location.trim() || null,
      capacity: form.capacity || null,
      isPublic: form.isPublic,
      code: eventCode, // Store code as field for easy queries
      hostUid: auth.currentUser.uid,
      status: 'setup', // setup → live → ended
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    $q.notify({ 
      type: 'positive', 
      message: `Event created successfully! Your event code is: ${eventCode}`,
      timeout: 5000,
      caption: 'Share this 5-digit code with participants to join your event'
    })
    
    // Redirect to event management page
    await router.replace({ 
      path: `/events/${eventCode}`, 
      query: { created: '1' } 
    })
    
  } catch (error) {
    console.error('Event creation error:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'We could not save your event. Please try again.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.event-create-page {
  min-height: 100%;
  background: linear-gradient(180deg, #edf2fb 0%, #ffffff 90%);
}
</style>