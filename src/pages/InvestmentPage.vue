<template>
  <q-page class="q-pa-md">
    <!-- 
      Page Header with Tutorial Access
      Users can re-access onboarding tutorial anytime via help icon
    -->
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h4 text-weight-bold">
        Investment Portfolio
      </div>
      <!-- Tutorial Access Button -->
      <q-btn 
        icon="help" 
        round 
        flat 
        color="grey-6"
        @click="showTutorial = true"
      >
        <q-tooltip>Show Tutorial</q-tooltip>
      </q-btn>
    </div>

    <!-- Portfolio Summary Card -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6">Your PreMoney Balance</div>
            <div class="text-h3 text-primary text-weight-bold">
              {{ formatCurrency(userStore.user?.premoney || 0) }}
            </div>
          </div>
          <!-- Event Badge -->
          <q-badge color="positive" class="text-h6">
            Event: {{ eventStore.currentEvent?.name }}
          </q-badge>
        </div>
      </q-card-section>
    </q-card>

    <!-- Startups List Section -->
    <div class="text-h5 q-mb-md">Available Startups</div>
    <div class="row q-col-gutter-md">
      <!-- 
        Startup Cards Grid
        Responsive layout: 1 column on mobile, 2 on tablet, 3 on desktop
      -->
      <div 
        v-for="startup in startups" 
        :key="startup.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <startup-card 
          :startup="startup" 
          @invest="handleInvest"
        />
      </div>
    </div>

    <!-- 
      Tutorial Dialog
      Reusable onboarding component in a modal for quick access
    -->
    <q-dialog v-model="showTutorial" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">Event Tutorial</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Embedded onboarding component -->
          <event-onboarding :embedded="true" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            label="Close" 
            color="primary" 
            v-close-popup 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useEventStore } from 'stores/event-store'
import { useUserStore } from 'stores/user-store'
import { useRouter } from 'vue-router'
import StartupCard from 'components/StartupCard.vue'
import EventOnboarding from 'components/EventOnboarding.vue'


/**
 * InvestmentPage Component
 * 
 * Main investment interface that provides:
 * - Portfolio balance display
 * - Startup investment opportunities
 * - Tutorial re-access functionality
 * - Event context display
 * 
 * @component
 * @example <InvestmentPage />
 */


export default {
  name: 'InvestmentPage',
  
  components: {
    StartupCard,
    EventOnboarding
  },
  
  setup() {
    // ========== REACTIVE STATE ==========
    
    /** @type {import('vue').Ref<boolean>} Controls tutorial dialog visibility */
    const showTutorial = ref(false)
    
    const eventStore = useEventStore()
    const userStore = useUserStore()
    const router = useRouter()
    
    /** @type {import('vue').Ref<Array>} List of available startups for investment */
    const startups = ref([])

    // ========== METHODS ==========
    
    /**
     * Formats PreMoney amount with proper formatting
     * Example: 10000 becomes "10,000 PM"
     * 
     * @param {number} amount - The PreMoney amount to format
     * @returns {string} Formatted currency string
     */
    const formatCurrency = (amount) => {
      return amount.toLocaleString('en-US') + ' PM'
    }

    /**
     * Handles investment actions from startup cards
     * 
     * @param {string} startupId - ID of the startup being invested in
     * @param {number} amount - Amount of PreMoney to invest
     */
    const handleInvest = (startupId, amount) => {
      // TODO: Implement investment logic
      // This would typically:
      // 1. Validate user has sufficient PreMoney
      // 2. Update user's portfolio in Firestore
      // 3. Update startup's raised amount
      // 4. Refresh UI state
      console.log(`Investing ${amount} in startup ${startupId}`)
    }

    /**
     * Loads available startups for the current event
     * In a real app, this would fetch from Firestore
     */
    const loadStartups = async () => {
      // Mock data - replace with actual Firestore query
      startups.value = [
        {
          id: '1',
          name: 'TechFlow AI',
          description: 'AI-powered workflow automation',
          valuation: 5000000,
          fundingGoal: 500000,
          raised: 250000
        },
        {
          id: '2', 
          name: 'EcoPack Solutions',
          description: 'Sustainable packaging materials',
          valuation: 3000000,
          fundingGoal: 300000,
          raised: 150000
        }
        // Add more startups as needed
      ]
    }

    // ========== LIFECYCLE HOOKS ==========
    
    /**
     * Component mounted lifecycle hook
     * Ensures user has valid event context before showing investment page
     */
    onMounted(() => {
      if (!eventStore.currentEvent) {
        // No active event - redirect to code entry
        router.push('/event-code')
      } else {
        // Load startups for the current event
        loadStartups()
      }
    })

    // ========== TEMPLATE EXPOSURE ==========
    return {
      showTutorial,
      eventStore,
      userStore,
      startups,
      formatCurrency,
      handleInvest
    }
  }
}
</script>

<!-- 
  No additional styles needed - using Quasar's utility classes
  and component styling for consistent design language
-->