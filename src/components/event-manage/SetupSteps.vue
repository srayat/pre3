<template>
  <div class="setup-steps">
    <!-- Success banner for newly created events -->
    <q-banner 
      v-if="recentlyCreated && !loading"
      class="bg-positive text-white q-mb-md"
    >
      <template v-slot:avatar>
        <q-icon name="check_circle" />
      </template>
      <strong>Event created successfully!</strong> Now set up the details below.
    </q-banner>

    <!-- Setup Steps Cards - VERTICAL STACK -->
    <div class="column q-gutter-md">
      <!-- Event Info Card -->
      <q-card class="setup-card cursor-pointer" @click="$emit('open-section', 'event-info')">
        <q-card-section class="row items-center">
          <q-icon name="event" size="lg" color="primary" class="q-mr-md" />
          <div class="col">
            <div class="text-h6 text-weight-bold">Event Info</div>
            <div class="text-body2 text-grey-8">
              View and edit event details
            </div>
          </div>
          <q-badge v-if="eventData" color="primary" class="text-subtitle2">
            {{ eventData.eventName || 'Manage' }}
          </q-badge>
        </q-card-section>
      </q-card>

      <!-- Startups Card -->
      <q-card class="setup-card cursor-pointer" @click="$emit('open-section', 'startup')">
        <q-card-section class="row items-center">
          <q-icon name="business_center" size="lg" color="primary" class="q-mr-md" />
          <div class="col">
            <div class="text-h6 text-weight-bold">Add Startups</div>
            <div class="text-body2 text-grey-8">
              Manage pitching startups
            </div>
          </div>
          <q-badge color="primary" class="text-subtitle2">
            {{ startupCount }} added
          </q-badge>
        </q-card-section>
      </q-card>

      <!-- Judges Card -->
      <q-card class="setup-card cursor-pointer" @click="$emit('open-section', 'judge')">
        <q-card-section class="row items-center">
          <q-icon name="gavel" size="lg" color="primary" class="q-mr-md" />
          <div class="col">
            <div class="text-h6 text-weight-bold">Add Judges</div>
            <div class="text-body2 text-grey-8">
              Manage event judges
            </div>
          </div>
          <q-badge color="primary" class="text-subtitle2">
            {{ judgeCount }} added
          </q-badge>
        </q-card-section>
      </q-card>

      <!-- Rating Questions Card -->
      <q-card class="setup-card cursor-pointer" @click="$emit('open-section', 'rating')">
        <q-card-section class="row items-center">
          <q-icon name="quiz" size="lg" color="primary" class="q-mr-md" />
          <div class="col">
            <div class="text-h6 text-weight-bold">Rating Questions</div>
            <div class="text-body2 text-grey-8">
              Configure evaluation criteria
            </div>
          </div>
          <q-badge :color="ratingQuestionsEnabled ? 'positive' : 'grey'"  class="text-subtitle2">
            {{ ratingQuestionsEnabled ? 'Enabled' : 'Not set' }}
          </q-badge>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  recentlyCreated: Boolean,
  eventData: Object,
  startupCount: {
    type: Number,
    default: 0
  },
  judgeCount: {
    type: Number,
    default: 0
  },
  ratingQuestionsEnabled: Boolean
})

defineEmits(['open-section'])
</script>

<style scoped>
.setup-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.setup-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  background: #e8e8e8;
  border: 1px solid #d1d1d1;
}
</style>