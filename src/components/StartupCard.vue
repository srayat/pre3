<template>
  <q-card class="startup-card q-mb-md">
    <q-card-section>
      <!-- Startup Header - Clickable Name -->
      <div class="row items-center justify-between q-mb-sm">
        <div 
          class="text-h5 text-weight-bold text-primary cursor-pointer"
          @click="openStartupProfile"
        >
          {{ startup.name }}
          <q-icon name="open_in_new" size="16px" class="q-ml-xs" />
        </div>
        
        <!-- Rating Button - Now goes to rating page -->
        <q-btn 
          round 
          color="orange" 
          icon="star" 
          @click="openRatingPage"
        >
          <q-tooltip>Rate this pitch</q-tooltip>
          <q-badge 
            v-if="hasRated" 
            color="red" 
            floating 
            rounded 
          />
        </q-btn>
      </div>

      <!-- Startup Description -->
      <div class="text-body1 text-grey-8 q-mb-md">
        {{ startup.description }}
      </div>

      <!-- Investment Section -->
      <div class="investment-section">
        <!-- Custom Amount Input -->
        <div class="row items-center q-gutter-sm">
          <q-input
            v-model.number="investmentAmount"
            type="number"
            placeholder="Custom amount"
            :min="10"
            :max="maxInvestment"
            dense
            class="col-grow"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" />
            </template>
          </q-input>
          
          <q-btn 
            color="positive" 
            label="Invest" 
            @click="handleInvest"
            :disable="!isValidInvestment"
            :loading="isInvesting"
          />
        </div>

        <!-- Available Balance -->
        <div class="text-caption text-grey-6 q-mt-sm">
          Available: {{ formatCurrency(maxInvestment) }} PreMoney
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from 'src/stores/user-store'
import { useRouter } from 'vue-router'

export default {
  name: 'StartupCard',
  props: {
    startup: {
      type: Object,
      required: true
    }
  },
  emits: ['invest'],
  setup(props, { emit }) {
    const investmentAmount = ref(0)
    const isInvesting = ref(false)
    const hasRated = ref(false)
    const userStore = useUserStore()
    const router = useRouter()

    const quickAmounts = [1000, 2500, 5000, 10000]

    const maxInvestment = computed(() => {
      return userStore.user?.premoney || 0
    })

    const isValidInvestment = computed(() => {
      return investmentAmount.value > 0 && 
             investmentAmount.value <= maxInvestment.value
    })

    const formatCurrency = (amount) => {
      return amount.toLocaleString('en-US') + ' PM'
    }

    const openStartupProfile = () => {
      router.push(`/startup/${props.startup.id}`)
    }

    const openRatingPage = () => {
      router.push(`/rate-startup/${props.startup.id}`)
    }

    const handleInvest = async () => {
      if (!isValidInvestment.value) return
      
      isInvesting.value = true
      try {
        emit('invest', props.startup.id, investmentAmount.value)
        investmentAmount.value = 0
      } finally {
        isInvesting.value = false
      }
    }

    return {
      investmentAmount,
      isInvesting,
      hasRated,
      quickAmounts,
      maxInvestment,
      isValidInvestment,
      formatCurrency,
      openStartupProfile,
      openRatingPage,
      handleInvest
    }
  }
}
</script>

<style scoped>
.startup-card {
  transition: transform 0.2s ease-in-out;
}

.startup-card:hover {
  background: #f1f1f1;
}

.quick-invest-btn {
  min-width: 80px;
}
</style>