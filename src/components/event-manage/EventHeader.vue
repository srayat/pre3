<template>
  <q-card flat bordered class="event-card">
    <q-inner-loading :showing="loading">
      <q-spinner color="primary" size="32px" />
    </q-inner-loading>

    <div v-if="eventData" class="column q-gutter-sm">
      <div class="text-h6 text-weight-bold text-primary">
        {{ eventData.name }}
      </div>
      <div class="text-body2 text-grey-7">
        {{ eventData.description || 'No description provided.' }}
      </div>

      <div class="row text-body2 text-grey-8 q-gutter-sm">
        <span v-if="formattedDate">
          <q-icon name="event" size="16px" class="q-mr-xs" />
          {{ formattedDate }}
        </span>
        <span v-if="eventData.location">
          <q-icon name="place" size="16px" class="q-mr-xs" />
          {{ eventData.location }}
        </span>
        <span>
          <q-icon name="people" size="16px" class="q-mr-xs" />
          Capacity: {{ eventData.capacity || 'N/A' }}
        </span>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-badge color="primary" align="middle" rounded>
          {{ eventData.status || 'draft' }}
        </q-badge>
        <div class="text-caption text-grey-6">
          Last updated: {{ formattedUpdatedAt }}
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="text-negative">
      Event not found or you no longer have access.
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  eventData: Object,
  loading: Boolean
})

const formattedDate = computed(() => {
  if (!props.eventData?.date) return null
  const [year, month, day] = props.eventData.date.split('-').map(Number)
  if (!year || !month || !day) return props.eventData.date
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

const formattedUpdatedAt = computed(() => {
  if (!props.eventData?.updatedAt) return 'N/A'
  const ts = props.eventData.updatedAt.toDate?.() ?? props.eventData.updatedAt
  return new Date(ts).toLocaleString()
})
</script>