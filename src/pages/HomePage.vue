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
          
          <!-- Updated for 5-digit numeric codes -->
          <q-input
            v-model="code"
            label="5-Digit Code"
            mask="#####"
            fill-mask
            unmasked-value
            :rules="[val => val.length === 5 && /^\d+$/.test(val) || 'Please enter 5 digits']"
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
            class="full-width q-mt-lg"
          >
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              Validating...
            </template>
          </q-btn>
        </div>
      </q-form>

      <!-- Updated Help Text -->
      <div class="text-caption text-grey-6 q-mt-xl text-center">
        <div>Don't have a code?</div>
        <div>Contact your event organizer to get your unique 5-digit event code.</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useEventStore } from 'src/stores/event-store'
import { useRouter } from 'vue-router'

export default {
  name: 'HomePage',
  setup() {
    const code = ref('')
    const eventStore = useEventStore()
    const router = useRouter()

    const handleSubmit = async () => {
      console.log('Submit clicked, code:', code.value)
      
      const isValid = await eventStore.validateEventCode(code.value)
      console.log('Validation result:', isValid)
      console.log('Error message:', eventStore.error)
      console.log('Current event:', eventStore.currentEvent)
      console.log('Has completed onboarding:', eventStore.hasCompletedOnboarding)
      
      if (isValid) {
        console.log('Navigation: hasCompletedOnboarding =', eventStore.hasCompletedOnboarding)
        if (eventStore.hasCompletedOnboarding) {
          console.log('Redirecting to /investment')
          router.push('/investment')
        } else {
          console.log('Redirecting to /onboarding')
          router.push('/onboarding')
        }
      } else {
        console.log('Validation failed, error:', eventStore.error)
      }
    }

    return {
      code,
      isLoading: eventStore.isLoading,
      error: eventStore.error,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.letter-spacing-4 {
  letter-spacing: 0.5em;
  padding-left: 0.5em;
}
</style>