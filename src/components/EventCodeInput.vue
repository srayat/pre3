<template>
  <q-page class="row items-center justify-center q-pa-md">
    <!-- 
      Main container with centered layout
      Uses Quasar's flexbox utilities for perfect centering
    -->
    <div class="column items-center" style="max-width: 400px; width: 100%">
      
      <!-- Header Section -->
      <div class="text-center q-mb-xl">
        <!-- Visual icon for better UX -->
        <q-icon name="qr_code_scanner" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h4 text-weight-bold">Enter Event Code</div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Enter the 4-digit code provided by your event organizer
        </div>
      </div>

      <!-- Code Input Form -->
      <q-form @submit="handleSubmit" class="full-width">
        <div class="column items-center q-gutter-y-md">
          
          <!-- 
            Code Input Field
            Features:
            - mask="####" ensures exactly 4 digits
            - fill-mask shows placeholder underscores
            - unmasked-value gives raw value without mask characters
            - letter-spacing for better digit separation
          -->
          <q-input
            v-model="code"
            label="4-Digit Code"
            mask="####"
            fill-mask
            unmasked-value
            :rules="[val => val.length === 4 || 'Please enter 4 digits']"
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

      <!-- Help Text for Users -->
      <div class="text-body1 text-grey-8 q-mt-xl text-center">
        <div>Don't have a code? 777</div>
        <div>Contact your event organizer to get your unique 4-digit event code.</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useEventStore } from 'stores/event-store'
import { useRouter } from 'vue-router'

/**
 * EventCodeInput Component
 * 
 * Purpose:
 * - Accept 4-digit event code from user
 * - Validate code against Firestore
 * - Route user to appropriate next page (onboarding or investment)
 * 
 * @component
 * @example <EventCodeInput />
 */
export default {
  name: 'EventCodeInput',
  
  setup() {
    // ========== REACTIVE STATE ==========
    const code = ref('') // Holds the 4-digit code input
    const eventStore = useEventStore() // Access event store
    const router = useRouter() // Vue Router for navigation

    // ========== METHODS ==========
    
    /**
     * Handles form submission
     * 1. Validates code with event store
     * 2. Routes to onboarding (first time) or investment page (returning user)
     */
    const handleSubmit = async () => {
      // Validate code and check event status
      const isValid = await eventStore.validateEventCode(code.value)
      
      if (isValid) {
        // Route based on onboarding completion status
        if (eventStore.hasCompletedOnboarding) {
          // Returning user - go directly to investment page
          router.push('/investment')
        } else {
          // First-time user - show onboarding flow
          router.push('/onboarding')
        }
      }
    }

    // ========== TEMPLATE EXPOSURE ==========
    return {
      code,
      isLoading: eventStore.isLoading, // Proxy loading state from store
      error: eventStore.error, // Proxy error state from store
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* 
  Enhanced digit spacing for better code readability
  Makes 4-digit codes easier to read and verify
*/
.letter-spacing-4 {
  letter-spacing: 0.5em;
  padding-left: 0.5em;
}
</style>