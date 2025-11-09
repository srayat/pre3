<template>
  <q-page class="event-create-page column q-pa-md">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-lg q-pt-lg">
      <q-btn flat round icon="arrow_back" color="primary" @click="goBack" />
      <div class="text-h5 text-weight-bold text-primary q-ml-sm">Create an Event</div>
      <div class="q-px-md"></div>
    </div>

    <div class="text-body1 text-grey-7 q-mb-lg">
      Share a few details to spin up your pitch event. You can invite founders and judges after
      saving.
    </div>

    <!-- Stepper -->
    <q-stepper v-model="currentStep" vertical color="primary" animated class="q-mb-lg">
      <q-step :name="1" title="Basic Information" icon="info" :done="currentStep > 1">
        <event-basic-info :form-data="form" :loading="loading" @update:form-data="updateForm" />
        <q-stepper-navigation class="q-mt-md">
          <q-btn
            @click="currentStep = 2"
            color="primary"
            label="Continue"
            :disable="!isStep1Valid"
          />
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
    <div class="text-body2 text-grey-7 q-mt-md">
      After creating an event, you will be able to invite startup founders and judges using their
      email addresses.
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
  isPublic: true,
})

const isStep1Valid = ref(false)

const updateForm = (newFormData) => {
  Object.assign(form, newFormData)
  isStep1Valid.value = checkStep1Validity()
}

function checkStep1Validity() {
  const hasName = form.name && form.name.trim().length > 0
  const hasDate = form.date && form.date.trim().length > 0

  if (!hasName || !hasDate) return false

  const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(form.date)
  if (!isValidFormat) return false

  try {
    const [year, month, day] = form.date.split('-').map(Number)
    const selectedDate = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    return selectedDate >= today
  } catch {
    return false
  }
}

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

  if (!form.date.trim()) {
    $q.notify({ type: 'warning', message: 'Event date is required.' })
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
</script>

<style scoped>
.event-create-page {
  min-height: 100%;
  background: linear-gradient(180deg, #edf2fb 0%, #ffffff 90%);
  box-sizing: border-box;
}
</style>
