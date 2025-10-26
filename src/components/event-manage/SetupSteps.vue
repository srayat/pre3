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
            <div class="text-caption text-grey">
              View and edit event details
            </div>
          </div>
          <q-badge v-if="eventData" color="primary">
            {{ eventData.eventName || 'Unnamed' }}
          </q-badge>
        </q-card-section>
      </q-card>

      <!-- Startups Card -->
      <q-card class="setup-card cursor-pointer" @click="$emit('open-section', 'startup')">
        <q-card-section class="row items-center">
          <q-icon name="business_center" size="lg" color="primary" class="q-mr-md" />
          <div class="col">
            <div class="text-h6 text-weight-bold">Add Startups</div>
            <div class="text-caption text-grey">
              Manage pitching startups
            </div>
          </div>
          <q-badge color="primary">
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
            <div class="text-caption text-grey">
              Manage event judges
            </div>
          </div>
          <q-badge color="primary">
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
            <div class="text-caption text-grey">
              Configure evaluation criteria
            </div>
          </div>
          <q-badge :color="ratingQuestionsEnabled ? 'positive' : 'grey'">
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
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
</style>