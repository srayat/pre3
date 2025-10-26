<template>
  <q-card
    v-if="active"
    ref="sectionRef"
    flat
    bordered
    class="section-card"
  >
    <div class="column q-gutter-sm q-mb-md">
      <div class="text-body2 text-grey-7">
        Configure the questions that audience and judges will use to rate startups.
      </div>
    </div>

    <RatingQuestions v-if="eventId" :event-id="eventId" />
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import RatingQuestions from './RatingQuestions.vue'

defineProps({
  active: Boolean,
  eventId: String
})

defineEmits(['close'])

const sectionRef = ref(null)
</script>

<style scoped>
.section-card {
  transition: opacity 0.25s ease;
  border: none;
}
</style>