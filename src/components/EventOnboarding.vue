<template>
  <q-page class="column">
    <!-- 
      Progress Indicator
      Shows user where they are in the multi-step onboarding process
    -->
    <div class="row justify-center q-pt-md">
      <div style="width: 300px">
        <q-linear-progress 
          :value="(currentStep + 1) / steps.length" 
          color="primary" 
          class="q-mb-md"
        />
        <div class="text-caption text-center text-grey-7">
          Step {{ currentStep + 1 }} of {{ steps.length }}
        </div>
      </div>
    </div>

    <!-- 
      Step Content Area
      Dynamically displays content based on current step
    -->
    <div class="col column items-center justify-center q-pa-lg">
      <div class="onboarding-content text-center" style="max-width: 600px">
        
        <!-- Step 1: Congratulations -->
        <div v-if="currentStep === 0" class="column items-center">
          <q-icon name="celebration" size="80px" color="positive" class="q-mb-lg" />
          <div class="text-h4 text-weight-bold q-mb-md">Congratulations! 🎉</div>
          <div class="text-h6 text-grey-8 q-mb-lg">
            You've received <span class="text-positive text-weight-bold">10,000 PreMoney</span>
          </div>
          <div class="text-body1">
            Welcome to the event! You now have 10,000 PreMoney to invest in innovative startups. 
            This fictional currency lets you practice investment strategies risk-free.
          </div>
        </div>

        <!-- Step 2: Event Goal -->
        <div v-if="currentStep === 1" class="column items-center">
          <q-icon name="flag" size="80px" color="primary" class="q-mb-lg" />
          <div class="text-h4 text-weight-bold q-mb-md">Event Goal</div>
          <div class="text-body1">
            <p class="q-mb-md">
              Your goal is to build the most valuable investment portfolio by identifying 
              promising startups and making strategic investments.
            </p>
            <p>
              Compete with other participants and learn how to evaluate startup potential 
              while managing your investment portfolio effectively.
            </p>
          </div>
        </div>

        <!-- Step 3: Rules -->
        <div v-if="currentStep === 2" class="column items-center">
          <q-icon name="rule" size="80px" color="orange" class="q-mb-lg" />
          <div class="text-h4 text-weight-bold q-mb-md">Rules</div>
          <div class="text-left">
            <ul class="q-pl-md">
              <li class="q-mb-sm">You start with 10,000 PreMoney</li>
              <li class="q-mb-sm">Invest in any startup listed in the event</li>
              <li class="q-mb-sm">Monitor your portfolio performance in real-time</li>
              <li class="q-mb-sm">Leaderboard rankings update every hour</li>
              <li class="q-mb-sm">Event ends on {{ eventEndDate }}</li>
              <li>Have fun and learn about startup investing!</li>
            </ul>
          </div>
        </div>

        <!-- Step 4: Strategy -->
        <div v-if="currentStep === 3" class="column items-center">
          <q-icon name="insights" size="80px" color="purple" class="q-mb-lg" />
          <div class="text-h4 text-weight-bold q-mb-md">Investment Strategy</div>
          <div class="text-body1">
            <p class="q-mb-md">
              <strong>Diversify:</strong> Don't put all your PreMoney in one startup. 
              Spread your investments to manage risk.
            </p>
            <p class="q-mb-md">
              <strong>Research:</strong> Check each startup's details, team, and market potential 
              before investing.
            </p>
            <p>
              <strong>Monitor:</strong> Keep an eye on your portfolio and market changes. 
              Be ready to adjust your strategy!
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 
      Navigation Controls
      Back/Next buttons with conditional logic
    -->
    <div class="row justify-between items-center q-pa-lg">
      <!-- Back Button - Only show if not on first step -->
      <q-btn 
        v-if="currentStep > 0"
        label="Back" 
        flat 
        color="primary" 
        @click="previousStep"
      />
      <div v-else></div> <!-- Spacer to maintain layout -->

      <!-- Next/Complete Button -->
      <q-btn 
        :label="currentStep === steps.length - 1 ? 'Start Investing' : 'Next'"
        color="primary"
        @click="nextStep"
      />
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useEventStore } from 'stores/event-store'
import { useRouter } from 'vue-router'

/**
 * EventOnboarding Component
 * 
 * Multi-step onboarding wizard that:
 * - Welcomes users and explains PreMoney reward
 * - Explains event goals, rules, and strategies
 * - Completes onboarding when finished
 * - Redirects returning users directly to investment page
 * 
 * @component
 * @example <EventOnboarding />
 */
export default {
  name: 'EventOnboarding',
  
  setup() {
    // ========== REACTIVE STATE ==========
    
    /** @type {import('vue').Ref<number>} Current step index (0-based) */
    const currentStep = ref(0)
    
    const eventStore = useEventStore()
    const router = useRouter()

    // ========== COMPUTED PROPERTIES ==========
    
    /**
     * Step definitions for the onboarding flow
     * @type {string[]}
     */
    const steps = [
      'Congratulations', // Step 0: Welcome and PreMoney award
      'Goal',            // Step 1: Event objectives
      'Rules',           // Step 2: Game rules
      'Strategy'         // Step 3: Investment tips
    ]

    /**
     * Formats the event end date for display
     * Falls back to generic text if no date available
     */
    const eventEndDate = computed(() => {
      if (!eventStore.currentEvent?.endDate) return 'the specified date'
      return new Date(eventStore.currentEvent.endDate).toLocaleDateString()
    })

    // ========== METHODS ==========
    
    /**
     * Advances to next step or completes onboarding
     * On final step: marks onboarding complete and navigates to investment page
     */
    const nextStep = async () => {
      if (currentStep.value < steps.length - 1) {
        // Move to next step in onboarding
        currentStep.value++
      } else {
        // Final step: complete onboarding and proceed to investment
        await eventStore.completeOnboarding()
        router.push('/investment')
      }
    }

    /**
     * Returns to previous step in onboarding flow
     */
    const previousStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }

    // ========== LIFECYCLE HOOKS ==========
    
    /**
     * Component mounted lifecycle hook
     * Prevents showing onboarding to users who've already completed it
     */
    onMounted(() => {
      if (eventStore.hasCompletedOnboarding) {
        // User already completed onboarding - skip to investment
        router.push('/investment')
      }
    })

    // ========== TEMPLATE EXPOSURE ==========
    return {
      currentStep,
      steps,
      eventEndDate,
      nextStep,
      previousStep
    }
  }
}
</script>

<!-- 
  No scoped styles needed - using Quasar utility classes
  All styling handled through Quasar's CSS classes for consistency
-->