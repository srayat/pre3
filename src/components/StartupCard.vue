<template>
  <q-card class="startup-card q-pa-md q-mb-md shadow-2">
    <!-- 🔹 Header: Startup Name -->
    <div class="row items-center justify-between q-mb-sm">
      <div
        class="text-h6 text-weight-bold text-blue-grey-9 cursor-pointer"
        @click="openStartupProfile"
      >
        {{ startup.name }}
      </div>
    </div>

    <!-- 🔹 Description -->
    <div class="text-body2 text-grey-8 q-mb-md line-clamp">
      {{ startup.description || 'No description provided.' }}
    </div>

    <!-- 🔹 Bottom Row: Rating (left) + Investment (right) -->
    <div class="row items-center justify-between">
      <!-- ⭐ Rating Button -->
      <q-btn
        :color="isRated ? 'grey-5' : 'blue-7'"
        :icon="isRated ? 'star' : 'star_border'"
        @click="openRatingPage"
        unelevated
      >
        <q-tooltip>
          {{ isRated ? 'You already rated this startup' : 'Rate this pitch' }}
        </q-tooltip>
      </q-btn>

      <!-- 💰 Investment Input + Button -->
      <div class="row items-center q-gutter-sm">
        <q-input
          v-model.number="localAmount"
          type="number"
          dense
          outlined
          :disable="disabled"
          :min="0"
          style="width: 100px"
          placeholder="PM"
          @keyup.enter="commitChange"
        />
        <q-btn
          color="blue-7"
          label="Invest"
          unelevated
          :disable="disabled || localAmount <= 0"
          @click="commitChange"
        />
      </div>
    </div>

    <div class="text-caption text-grey-6 q-mt-xs text-right">Use your PreMoney balance</div>
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
  isRated: Boolean,
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

// const hasRated = ref(false) // can be removed
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
