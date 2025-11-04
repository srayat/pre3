<template>
  <q-page class="column">
    <!-- Progress Indicator -->
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

    <!-- Step Content -->
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
            Welcome to the event! You now have 10,000 PreMoney to invest in today's startups. This
            fictional currency lets you practice investment strategies risk-free.
          </div>
        </div>

        <!-- Step 2: Event Goal -->
        <div v-if="currentStep === 1" class="column items-center">
          <q-icon name="flag" size="80px" color="primary" class="q-mb-lg" />
          <div class="text-h4 text-weight-bold q-mb-md">Event Goal</div>
          <div class="text-body1">
            <p class="q-mb-md">
              Your goal is to build the most valuable investment portfolio by identifying promising
              startups and making strategic investments.
            </p>
            <p>
              Compete with other participants and learn how to evaluate startup potential while
              managing your investment portfolio effectively.
            </p>
          </div>
        </div>

        <!-- Step 3: Rules -->
        <div v-if="currentStep === 2" class="column items-center">
          <q-icon name="rule" size="80px" color="orange" class="q-mb-lg" />
          <div class="text-h4 text-weight-bold q-mb-md">Rules</div>
          <div class="text-left">
            <ul class="q-pl-md">
              <li class="q-mb-sm">You start with 10,000 PreMoney for the event</li>
              <li class="q-mb-sm">Invest in any startup listed in the event</li>
              <li class="q-mb-sm">
                You can change your investments anytime till event closes on the app
              </li>
              <li class="q-mb-sm">Your max-limit is 10,000 for the event</li>
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
              <strong>Diversify:</strong> Don't put all your PreMoney in one startup. Spread your
              investments to manage risk.
            </p>
            <p class="q-mb-md">
              <strong>Research:</strong> Check each startup's details, team, and market potential
              before investing.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="row justify-between items-center q-pa-lg">
      <q-btn v-if="currentStep > 0" label="Back" flat color="primary" @click="previousStep" />
      <div v-else></div>

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

export default {
  name: 'EventOnboarding',

  setup(props) {
    // ✅ Accept eventId if passed from EventOnboardingPage.vue
    const eventId = props.eventId

    const currentStep = ref(0)
    const eventStore = useEventStore()
    const router = useRouter()

    const steps = ['Congratulations', 'Goal', 'Rules', 'Strategy']

    const eventEndDate = computed(() => {
      if (!eventStore.currentEvent?.endDate) return 'the specified date'
      return new Date(eventStore.currentEvent.endDate).toLocaleDateString()
    })

    // ✅ FIXED: Correct navigation to investment page
    const nextStep = async () => {
      if (currentStep.value < steps.length - 1) {
        currentStep.value++
      } else {
        await eventStore.completeOnboarding()
        const id = eventId || eventStore.currentEvent?.id
        if (!id) {
          console.error('⚠️ No event ID found — cannot navigate to investment page.')
          return
        }
        router.push({ name: 'investment', params: { eventId: id } })
      }
    }

    const previousStep = () => {
      if (currentStep.value > 0) currentStep.value--
    }

    // ✅ FIXED: Redirect properly if user already completed onboarding
    onMounted(() => {
      if (eventStore.hasCompletedOnboarding) {
        const id = eventId || eventStore.currentEvent?.id
        if (id) router.push({ name: 'investment', params: { eventId: id } })
      }
    })

    return {
      currentStep,
      steps,
      eventEndDate,
      nextStep,
      previousStep,
    }
  },

  props: {
    eventId: {
      type: String,
      required: false,
    },
  },
}
</script>
