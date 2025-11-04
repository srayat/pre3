<template>
  <q-card class="startup-card q-mb-md">
    <q-card-section>
      <!-- Startup Header - Clickable Name -->
      <div class="row items-center justify-between q-mb-sm">
        <div
          class="text-h6 text-weight-bold text-primary cursor-pointer"
          @click="openStartupProfile"
        >
          {{ startup.name }}
        </div>

        <!-- Rating Button - Now goes to rating page -->
        <q-btn round color="orange" icon="star" @click="openRatingPage">
          <q-tooltip>Rate this pitch</q-tooltip>
          <q-badge v-if="hasRated" color="red" floating rounded />
        </q-btn>
      </div>

      <!-- Startup Description -->
      <div class="text-body1 text-grey-8 q-mb-md">
        {{ startup.description }}
      </div>

      <!-- Investment Section - ONLY THIS PART CHANGED -->
      <div v-if="typeof invested !== 'undefined'" class="q-mt-md">
        <div class="row items-center q-gutter-sm">
          <q-input
            v-model.number="localAmount"
            type="number"
            placeholder="Enter amount"
            outlined
            dense
            :disable="disabled"
            :min="0"
            class="col-grow text-h6"
            @keyup.enter="commitChange"
          >
            <template #prepend>
              <span class="text-grey-7 text-caption">PM</span>
            </template>
          </q-input>

          <q-btn
            color="positive"
            label="Invest"
            unelevated
            :disable="disabled || localAmount <= 0"
            @click="commitChange"
          />
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">Use your PreMoney balance</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from 'quasar'

const props = defineProps({
  startup: Object,
  invested: Number,
  disabled: Boolean,
  eventId: String,
})
const emit = defineEmits(['update-investment'])

const localAmount = ref(props.invested || 0)
watch(
  () => props.invested,
  (val) => (localAmount.value = val),
)

const commitChange = debounce(() => {
  emit('update-investment', Number(localAmount.value))
}, 300)

const hasRated = ref(false)
const router = useRouter()

const openStartupProfile = () => {
  router.push(`/startup/${props.startup.id}`)
}

const openRatingPage = () => {
  router.push(`/rate-startup/${props.eventId}/${props.startup.id}`)
}
</script>

<style scoped>
.startup-card {
  transition: transform 0.2s ease-in-out;
}

.startup-card:hover {
  background: #f1f1f1;
}
</style>
