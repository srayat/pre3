<template>
  <q-card flat bordered class="leaderboard-card">
    <q-card-section>
      <div class="text-h6 text-primary text-center q-mb-md">{{ data.title }}</div>

      <div v-if="!data.leaderboard || data.leaderboard.length === 0" class="text-center q-pa-md">
        <q-icon name="inbox" size="48px" color="grey-5" />
        <div class="text-body2 text-grey-6 q-mt-sm">No data available</div>
      </div>

      <q-list v-else separator>
        <q-item v-for="entry in data.leaderboard" :key="entry.startupId" class="leaderboard-item">
          <q-item-section side class="rank-section">
            <q-badge :color="getRankColor(entry.rank)" class="rank-badge">
              #{{ entry.rank }}
            </q-badge>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ entry.name }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label class="text-weight-bold text-primary">
              {{ formatValue(entry.total, data.metric) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
})

function getRankColor(rank) {
  if (rank === 1) return 'warning' // Gold
  if (rank === 2) return 'grey-6' // Silver
  if (rank === 3) return 'orange-7' // Bronze
  return 'grey-5'
}

function formatValue(value, metric) {
  if (metric === 'investment') {
    return `$${value.toLocaleString()}`
  }
  return value.toFixed(1)
}
</script>

<style scoped>
.leaderboard-card {
  margin-bottom: 1rem;
}

.leaderboard-item {
  padding: 12px 16px;
}

.rank-section {
  min-width: 60px;
}

.rank-badge {
  font-size: 0.875rem;
  padding: 4px 8px;
}
</style>
