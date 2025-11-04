<template>
  <q-page class="row items-center justify-center q-pa-md">
    <div class="column items-center" style="max-width: 400px; width: 100%">
      <!-- Header Section -->
      <div class="text-center q-mb-xl">
        <q-icon name="qr_code_scanner" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h4 text-weight-bold">Enter Event Code</div>
        <div class="text-subtitle1 text-blue-grey-10 q-mt-sm">
          Enter the 5-digit code provided by your event organizer
        </div>
      </div>

      <!-- Code Input Form -->
      <q-form @submit="handleSubmit" class="full-width">
        <div class="column items-center q-gutter-y-md">
          <!-- Updated for 5-digit numeric codes -->
          <q-input
            v-model="code"
            label="5-Digit Code"
            mask="#####"
            fill-mask
            unmasked-value
            outlined
            :rules="[(val) => (val.length === 5 && /^\d+$/.test(val)) || 'Please enter 5 digits']"
            input-class="text-h5 text-center letter-spacing-4"
            class="full-width"
            :disable="isLoading"
            @keyup.enter="handleSubmit"
          />

          <!-- Error Display -->
          <div v-if="error" class="text-negative text-caption text-center">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <q-btn
            label="Join Event"
            type="submit"
            color="primary"
            size="lg"
            :loading="isLoading"
            class="q-mt-lg q-px-lg"
          >
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Validating...
            </template>
          </q-btn>
        </div>
      </q-form>

      <!-- Updated Help Text -->
      <div class="text-grey-8 q-mt-xl text-center text-body1">
        <div>Don't have a code?</div>
        <div>Contact your event organizer to get the 5-digit event code.</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getDoc, doc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useEventStore } from 'stores/event-store'

const router = useRouter()
const $q = useQuasar()
const eventStore = useEventStore()

const code = ref('')
const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  const eventCode = code.value.trim()

  if (!/^\d{5}$/.test(eventCode)) {
    error.value = 'Please enter a valid 5-digit code.'
    return
  }

  isLoading.value = true

  try {
    const eventRef = doc(db, 'events', eventCode)
    const snap = await getDoc(eventRef)

    if (!snap.exists()) {
      error.value = 'No event found with this code.'
      return
    }

    const eventData = snap.data()
    eventStore.currentEvent = { id: eventCode, ...eventData }

    // Handle event states
    if (eventData.status === 'setup') {
      $q.dialog({
        title: 'Event Not Live',
        message: 'This event is still being set up. Please try again later.',
        ok: { label: 'OK', color: 'primary' },
      })
      return
    }

    if (eventData.status === 'ended') {
      $q.dialog({
        title: 'Event Ended',
        message: 'This event has already ended.',
        ok: { label: 'OK', color: 'primary' },
      })
      return
    }

    if (eventData.status === 'live') {
      await router.replace({ name: 'event-onboarding', params: { eventId: eventCode } })
    }
  } catch (err) {
    console.error('Error validating event:', err)
    error.value = 'Unable to validate event. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.letter-spacing-4 {
  letter-spacing: 0.5em;
  padding-left: 0.5em;
}
</style>

<style scoped>
.letter-spacing-4 {
  letter-spacing: 0.5em;
  padding-left: 0.5em;
}
</style>
