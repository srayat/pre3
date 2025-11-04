<template>
  <EventOnboarding :event-id="eventId" />
</template>

<script setup>
import { useRoute } from 'vue-router'
import EventOnboarding from 'components/EventOnboarding.vue'

const route = useRoute()
const eventId = route.params.eventId
</script>
