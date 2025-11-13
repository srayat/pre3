<!-- pages/EventResults.vue -->
<template>
  <div class="event-results-page">
    <!-- Loading State -->
    <div v-if="status === 'loading'" class="loading">
      <LoadingSpinner />
      <p>Loading results...</p>
    </div>

    <!-- Event Not Ended -->
    <div v-else-if="status === 'not_ended'" class="info-message">
      <h2>Event Still In Progress</h2>
      <p>Results will be available once the event ends.</p>
    </div>

    <!-- Results Being Calculated -->
    <div v-else-if="status === 'processing'" class="processing">
      <LoadingSpinner />
      <h2>Calculating Results...</h2>
      <p>This usually takes just a few seconds. Please wait.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="status === 'error'" class="error-message">
      <h2>Unable to Load Results</h2>
      <p>{{ error }}</p>
      <button @click="$router.go(-1)">Go Back</button>
    </div>

    <!-- Results Ready -->
    <div v-else-if="status === 'ready' && results" class="results-content">
      <h1>Event Results</h1>
      <p class="generated-time">Generated {{ formatTimestamp(generatedAt) }}</p>

      <!-- Investor Investment Leaderboard -->
      <LeaderboardCard
        v-if="results.startupInvestmentInvestor"
        :data="results.startupInvestmentInvestor"
      />

      <!-- Judge Investment Leaderboard -->
      <LeaderboardCard
        v-if="results.startupInvestmentJudge"
        :data="results.startupInvestmentJudge"
      />

      <!-- Investor Ratings Leaderboard -->
      <LeaderboardCard v-if="results.startupRatingInvestor" :data="results.startupRatingInvestor" />

      <!-- Judge Ratings Leaderboard -->
      <LeaderboardCard v-if="results.startupRatingJudge" :data="results.startupRatingJudge" />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useEventResults } from 'src/composables/useEventResults'
import LeaderboardCard from 'src/components/LeaderboardCard.vue'

const route = useRoute()
const eventId = route.params.eventId

// ✨ This is where the magic happens - just one line!
const { status, results, error, generatedAt } = useEventResults(eventId)

function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp.toDate()).toLocaleString()
}
</script>

<style scoped>
.event-results-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.processing {
  text-align: center;
  padding: 4rem 2rem;
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: #fee;
  border-radius: 8px;
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.generated-time {
  color: #666;
  font-size: 0.9rem;
}
</style>
