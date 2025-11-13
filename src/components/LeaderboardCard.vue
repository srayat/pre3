<template>
  <q-card flat bordered class="leaderboard-card investment-leaderboard">
    <q-card-section>
      <!-- Header -->
      <div class="leaderboard-header text-center q-mb-md">
        <div class="text-h6 text-weight-bold text-white">
          {{ data.title }}
        </div>
        <div class="subtitle">{{ data.subtitle }}</div>
      </div>

      <!-- Empty State -->
      <div v-if="!data.leaderboard || data.leaderboard.length === 0" class="empty-state">
        <q-icon name="inbox" size="48px" color="grey-5" />
        <div class="text-body2 text-grey-5 q-mt-sm">No data available</div>
      </div>

      <!-- Column Headers -->
      <div
        v-else
        class="column-header row items-center justify-between q-px-sm q-pb-xs no-wrap-header"
      >
        <div class="header-cell rank-header">Rank</div>
        <div class="header-cell name-header">Startup Name</div>
        <div class="header-cell value-header">
          {{ data.metric === 'investment' ? 'PreMoney Raised' : 'Total Points' }}
        </div>
      </div>

      <!-- Leaderboard Rows -->
      <q-list v-if="data.leaderboard && data.leaderboard.length > 0" class="leaderboard-list">
        <q-item
          v-for="entry in data.leaderboard"
          :key="entry.startupId"
          class="leaderboard-item"
          :class="`rank-${entry.rank}`"
        >
          <q-item-section side class="rank-section">
            <div class="rank-badge">{{ entry.rank }}</div>
          </q-item-section>

          <q-item-section>
            <q-item-label class="name text-weight-medium q-ml-sm">
              {{ entry.name }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label class="value text-weight-bold">
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
  data: { type: Object, required: true },
})

function formatValue(value, metric) {
  if (metric === 'investment') return `$${value.toLocaleString()}`
  return value.toFixed(1)
}
</script>

<style scoped>
/* ------------------------------
   General Card Styles
------------------------------ */
.leaderboard-card {
  border-radius: 9px;
  color: white;
  overflow: hidden;
  padding-bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* ------------------------------
   Background Variants
------------------------------ */
.investment-leaderboard {
  background: linear-gradient(160deg, #0b1d3a, #133a68, #1c4d8c);
}

.rating-leaderboard {
  background: linear-gradient(160deg, #3a1858, #522974, #6a3a8c);
}

/* ------------------------------
   Header
------------------------------ */
.leaderboard-header {
  padding-top: 0.25rem;
}
.subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

/* ------------------------------
   Column Header (No Wrapping)
------------------------------ */
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-size: 0.75rem;
  white-space: nowrap;
  gap: 8px;
}

.header-cell {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-header {
  flex: 0 0 60px;
  text-align: left;
}
.name-header {
  flex: 1 1 auto;
  text-align: left;
  margin-left: 0.5rem;
}
.value-header {
  flex: 0 0 130px; /* Ensures "PreMoney Raised" fits on one line */
  text-align: right;
}

/* ------------------------------
   Empty State
------------------------------ */
.empty-state {
  text-align: center;
  padding: 2rem;
}

/* ------------------------------
   Leaderboard Rows
------------------------------ */
.leaderboard-list {
  border-radius: 8px;
}
.leaderboard-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin: 6px 0;
  padding: 8px 12px;
  display: flex;
  align-items: center;
}

/* ------------------------------
   Rank Badge
------------------------------ */
.rank-section {
  width: 44px;
  text-align: center;
}
.rank-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  line-height: 36px;
  font-weight: 700;
  text-align: center;
  font-size: 0.9rem;
  color: #111;
}

/* Rank Colors */
.rank-1 .rank-badge {
  background: linear-gradient(145deg, #ffeb3b, #fdd835);
}
.rank-2 .rank-badge {
  background: linear-gradient(145deg, #e0e0e0, #bdbdbd);
}
.rank-3 .rank-badge {
  background: linear-gradient(145deg, #ffb74d, #f57c00);
}
.rank-4 .rank-badge,
.rank-5 .rank-badge {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}

/* ------------------------------
   Text Columns
------------------------------ */
.name {
  font-size: 1rem;
  color: #fff;
  letter-spacing: 0.2px;
}
.value {
  font-size: 1rem;
  color: #fff;
  opacity: 0.95;
}
</style>
