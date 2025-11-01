<template>
  <q-page class="event-create-page column q-pa-lg">
    <!-- Header -->
    <div class="row items-center q-mb-lg q-pt-lg">
      <q-btn flat round icon="arrow_back" color="primary" @click="goBack" />
      <div class="text-h5 text-weight-bold text-primary q-ml-sm">Create an Event</div>
    </div>

    <div class="text-body1 text-grey-7 q-mb-lg">
      Share a few details to spin up your pitch event. You can invite founders and judges after saving.
    </div>

    <!-- Stepper -->
    <q-stepper v-model="currentStep" vertical color="primary" animated class="q-mb-lg">
      <q-step :name="1" title="Basic Information" icon="info" :done="currentStep > 1">
        <event-basic-info :form-data="form" :loading="loading" @update:form-data="updateForm" />
        <q-stepper-navigation class="q-mt-md">
          <q-btn @click="currentStep = 2" color="primary" label="Continue" :disable="!form.name" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Event Settings" icon="settings" :done="currentStep > 2">
        <event-settings :form-data="form" :loading="loading" @update:form-data="updateForm" />
        <q-stepper-navigation class="q-mt-md">
          <q-btn flat @click="currentStep = 1" color="primary" label="Back" class="q-mr-sm" />
          <q-btn @click="currentStep = 3" color="primary" label="Continue" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="3" title="Preview & Create" icon="preview">
        <event-preview :form-data="form" />
        <q-stepper-navigation class="q-mt-md">
          <q-btn flat @click="currentStep = 2" color="primary" label="Back" class="q-mr-sm" />
          <q-btn @click="handleSubmit" color="positive" label="Create Event" :loading="loading" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>

    <q-separator class="q-mt-lg" />
    <div class="text-caption text-grey-6 q-mt-md">
      After creating an event, you will be able to invite startup founders and judges using their email addresses.
    </div>

    <!-- 🧪 DEBUG TEST SECTION -->
    <q-separator class="q-mt-xl" style="border: 2px solid red;" />
    <div class="q-mt-lg q-pa-md" style="background: #fff3cd; border-radius: 8px;">
      <div class="text-subtitle2 text-weight-bold text-orange-9 q-mb-sm">🧪 Debug Tests</div>
      <div class="text-caption text-grey-7 q-mb-md">
        Test if Cloud Functions can write to /users/ collection
      </div>
      <div class="row q-gutter-sm">
        <q-btn 
          @click="runTest1" 
          label="Test 1: Write User Doc" 
          color="orange" 
          size="sm"
          :loading="testLoading[0]"
        />
        <q-btn 
          @click="runTest2" 
          label="Test 2: Subcollection" 
          color="orange" 
          size="sm"
          :loading="testLoading[1]"
        />
        <q-btn 
          @click="runTest3" 
          label="Test 3: Read" 
          color="orange" 
          size="sm"
          :loading="testLoading[2]"
        />
        <q-btn 
          @click="runTest4" 
          label="Test 4: Batch" 
          color="orange" 
          size="sm"
          :loading="testLoading[3]"
        />
        <q-btn 
  @click="runDirectFetchTest" 
  label="🔬 Direct Fetch" 
  color="deep-orange" 
  size="sm"
/>
      </div>
      <div v-if="testResult" class="q-mt-md q-pa-sm" style="background: white; border-radius: 4px;">
        <div class="text-caption text-weight-bold">Result:</div>
        <pre class="text-caption">{{ testResult }}</pre>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from 'boot/firebase'

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

// 🧪 Test state
const testLoading = ref([false, false, false, false])
const testResult = ref(null)

const updateForm = (newFormData) => Object.assign(form, newFormData)

const goBack = () => router.back()

async function handleSubmit() {
  if (!auth.currentUser) {
    $q.notify({ type: 'negative', message: 'Please sign in first.' })
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
    const fn = httpsCallable(functions, 'createEvent')
    const result = await fn(form)

    $q.notify({
      type: 'positive',
      message: `Event created successfully! Your event code: ${result.data.eventId}`,
      timeout: 5000,
    })

    await router.replace({
      path: `/events/${result.data.eventId}`,
      query: { created: '1' },
    })
  } catch (error) {
    console.error('Event creation error:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to create event. Try again.',
    })
  } finally {
    loading.value = false
  }
}

// 🧪 Test Functions
async function runTest1() {
  testLoading.value[0] = true
  testResult.value = null
  
  // Check auth state
  console.log('🔍 Auth check:', {
    currentUser: auth.currentUser,
    uid: auth.currentUser?.uid,
    email: auth.currentUser?.email
  })
  
  if (!auth.currentUser) {
    $q.notify({ type: 'negative', message: 'You must be signed in first' })
    testLoading.value[0] = false
    return
  }
  
  try {
    // Force token refresh
    const token = await auth.currentUser.getIdToken(true)
    console.log('🔑 Got fresh token:', token.substring(0, 20) + '...')
    
    const test = httpsCallable(functions, 'testWriteUserDoc')
    const result = await test({})
    testResult.value = result.data
    console.log('✅ Test 1:', result.data)
    $q.notify({ type: 'positive', message: 'Test 1 passed!' })
  } catch (error) {
    testResult.value = { error: error.message, code: error.code }
    console.error('❌ Test 1 Full Error:', error)
    $q.notify({ type: 'negative', message: 'Test 1 failed: ' + error.message })
  } finally {
    testLoading.value[0] = false
  }
}

async function runTest2() {
  testLoading.value[1] = true
  testResult.value = null
  try {
    const test = httpsCallable(functions, 'testWriteUserSubcollection')
    const result = await test({ docId: 'test123' })
    testResult.value = result.data
    console.log('✅ Test 2:', result.data)
    $q.notify({ type: 'positive', message: 'Test 2 passed!' })
  } catch (error) {
    testResult.value = { error: error.message, code: error.code }
    console.error('❌ Test 2:', error)
    $q.notify({ type: 'negative', message: 'Test 2 failed: ' + error.message })
  } finally {
    testLoading.value[1] = false
  }
}

async function runTest3() {
  testLoading.value[2] = true
  testResult.value = null
  try {
    const test = httpsCallable(functions, 'testReadUserDoc')
    const result = await test({})
    testResult.value = result.data
    console.log('✅ Test 3:', result.data)
    $q.notify({ type: 'positive', message: 'Test 3 passed!' })
  } catch (error) {
    testResult.value = { error: error.message, code: error.code }
    console.error('❌ Test 3:', error)
    $q.notify({ type: 'negative', message: 'Test 3 failed: ' + error.message })
  } finally {
    testLoading.value[2] = false
  }
}

async function runTest4() {
  testLoading.value[3] = true
  testResult.value = null
  try {
    const test = httpsCallable(functions, 'testBatchWrite')
    const result = await test({})
    testResult.value = result.data
    console.log('✅ Test 4:', result.data)
    $q.notify({ type: 'positive', message: 'Test 4 passed!' })
  } catch (error) {
    testResult.value = { error: error.message, code: error.code }
    console.error('❌ Test 4:', error)
    $q.notify({ type: 'negative', message: 'Test 4 failed: ' + error.message })
  } finally {
    testLoading.value[3] = false
  }
}

// 🔬 Direct fetch test - bypasses Firebase SDK
async function runDirectFetchTest() {
  if (!auth.currentUser) {
    $q.notify({ type: 'negative', message: 'Not signed in' })
    return
  }
  
  try {
    const token = await auth.currentUser.getIdToken(true)
    console.log('🔬 Direct Fetch Test')
    console.log('Token:', token.substring(0, 30) + '...')
    
    const response = await fetch('https://us-central1-pre3-36e57.cloudfunctions.net/testWriteUserDoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data: {} })
    })
    
    console.log('Response status:', response.status)
    const text = await response.text()
    console.log('Response body:', text)
    
    if (response.ok) {
      $q.notify({ type: 'positive', message: 'Direct fetch worked!' })
    } else {
      $q.notify({ type: 'negative', message: `Direct fetch failed: ${response.status}` })
    }
  } catch (error) {
    console.error('❌ Direct fetch error:', error)
    $q.notify({ type: 'negative', message: 'Direct fetch error: ' + error.message })
  }
}
</script>


<style scoped>
.event-create-page {
  min-height: 100%;
  background: linear-gradient(180deg, #edf2fb 0%, #ffffff 90%);
}
</style>