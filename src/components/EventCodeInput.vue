<template>
  <q-page class="row items-center justify-center q-pa-md">
    <div class="column items-center" style="max-width: 400px; width: 100%">
      <!-- Header Section -->
      <div class="text-center q-mb-xl">
        <q-icon name="qr_code_scanner" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h4 text-weight-bold">Enter Event Code</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
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
              :ref="(el) => (inputRefs[index] = el)"
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
            class="full-width q-mt-lg"
          >
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Validating...
            </template>
          </q-btn>
        </div>
      </q-form>

      <!-- Help Text -->
      <div class="text-body1 text-grey-8 q-mt-xl text-center">
        <div>Don't have a code?</div>
        <div>Contact your event organizer to get your unique 5-digit event code.</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventStore } from 'stores/event-store'
import { useRouter } from 'vue-router'

const eventStore = useEventStore()
const router = useRouter()

// Array to hold each digit
const codeDigits = ref(['', '', '', '', ''])
const inputRefs = ref([])

// Computed full code
const code = computed(() => codeDigits.value.join(''))

// Loading and error states
const isLoading = computed(() => eventStore.isLoading)
const error = computed(() => eventStore.error)

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
}

/**
 * Handle backspace and arrow keys
 */
const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    // Move to previous box on backspace if current is empty
    inputRefs.value[index - 1]?.focus()
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
  }
}

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  if (code.value.length !== 5) return

  const isValid = await eventStore.validateEventCode(code.value)

  if (isValid) {
    if (eventStore.hasCompletedOnboarding) {
      router.push('/investment')
    } else {
      router.push('/profile-onboarding')
    }
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
