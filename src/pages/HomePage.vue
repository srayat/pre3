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
          <!-- 5-Digit PIN Style Input -->
          <div class="pin-input-container">
            <input
              v-for="(digit, index) in 5"
              :key="index"
              :ref="
                (el) => {
                  if (el) inputRefs[index] = el
                }
              "
              v-model="codeDigits[index]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="pin-box"
              :class="{ 'has-value': codeDigits[index] }"
              @input="handleInput(index, $event)"
              @keydown="handleKeydown(index, $event)"
              @paste="handlePaste"
              :disabled="isLoading"
            />
          </div>

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
            :disable="code.length !== 5"
            class="q-mt-lg q-px-lg"
          >
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Validating...
            </template>
          </q-btn>
        </div>
      </q-form>

      <!-- Help Text -->
      <div class="text-grey-8 q-mt-xl text-center text-body1">
        <div>Don't have a code?</div>
        <div>Contact your event organizer to get the 5-digit event code.</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getDoc, doc } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useEventStore } from 'stores/event-store'

const router = useRouter()
const $q = useQuasar()
const eventStore = useEventStore()

// PIN input state
const codeDigits = ref(['', '', '', '', ''])
const inputRefs = ref([])

const isLoading = ref(false)
const error = ref('')

// Computed full code
const code = computed(() => codeDigits.value.join(''))

/**
 * Handle input in a single box
 */
const handleInput = (index, event) => {
  const value = event.target.value

  // Only allow digits
  if (!/^\d*$/.test(value)) {
    codeDigits.value[index] = ''
    return
  }

  // Update the digit
  codeDigits.value[index] = value

  // Auto-focus next box if digit entered
  if (value && index < 4) {
    inputRefs.value[index + 1]?.focus()
  }

  // Auto-submit if all 5 digits filled
  // if (index === 4 && value && code.value.length === 5) {
  //   handleSubmit()
  //  }
}

/**
 * Handle backspace and arrow keys
 */
const handleKeydown = (index, event) => {
  if (event.key === 'Backspace') {
    if (!codeDigits.value[index] && index > 0) {
      // Move to previous box on backspace if current is empty
      codeDigits.value[index - 1] = ''
      inputRefs.value[index - 1]?.focus()
    } else {
      codeDigits.value[index] = ''
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < 4) {
    inputRefs.value[index + 1]?.focus()
  }
}

/**
 * Handle paste event
 */
const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').trim()

  // Only process if it's 5 digits
  if (/^\d{5}$/.test(pastedData)) {
    codeDigits.value = pastedData.split('')
    inputRefs.value[4]?.focus()
    // Auto-submit on paste
    // setTimeout(() => handleSubmit(), 100)
  }
}

const handleSubmit = async () => {
  error.value = ''
  const eventCode = code.value

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

// Auto-focus first input on mount
onMounted(() => {
  inputRefs.value[0]?.focus()
})
</script>

<style scoped>
.pin-input-container {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.pin-box {
  width: 56px;
  height: 64px;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #ffffff;
  color: #1976d2;
  transition: all 0.2s ease;
  outline: none;
  caret-color: #1976d2;
}

.pin-box:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.pin-box.has-value {
  border-color: #1976d2;
  background: #f5f9ff;
}

.pin-box:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Remove number input spinners */
.pin-box::-webkit-outer-spin-button,
.pin-box::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pin-box[type='number'] {
  -moz-appearance: textfield;
}
</style>
