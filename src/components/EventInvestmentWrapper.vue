<template>
  <div class="investment-wrapper">
    <component :is="investmentPageComponent" :event-id="eventId" />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

defineProps({
  eventId: {
    type: String,
    required: true,
  },
})

// Import your existing investment page
// Adjust the path to match your actual investment page location
const investmentPageComponent = defineAsyncComponent(
  () => import('pages/InvestmentPage.vue'), // or wherever your investment page is
)
</script>
