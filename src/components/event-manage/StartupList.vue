<template>
  <div>
    <!-- Empty State -->
    <div v-if="startups.length === 0" class="empty-state text-center q-pa-xl">
      <div class="text-h6 text-weight-medium text-grey-8 q-mb-sm">No startups yet</div>
      <div class="text-body2 text-grey-7">
        Add your first startup to get started with this event.
      </div>
    </div>

    <!-- Startup List -->
    <q-list v-else class="q-pa-sm">
      <q-item
        v-for="startup in startups"
        :key="startup.id"
        class="startup-card q-mb-md q-pa-md rounded-borders"
      >
        <!-- Main Info -->
        <q-item-section class="bg-grey-1">
          <q-item-label class="text-weight-bold text-body1 text-grey-9">
            {{ startup.name || 'Untitled Startup' }}
          </q-item-label>

          <q-item-label v-if="startup.description" class="text-body2 text-grey-7 q-mt-xs" lines="2">
            {{ startup.description }}
          </q-item-label>

          <div class="row q-gutter-sm q-mt-sm">
            <q-chip v-if="startup.industry" dense color="blue-1" text-color="blue-9" size="sm">
              {{ startup.industry }}
            </q-chip>

            <q-chip
              v-if="startup.website"
              dense
              color="green-1"
              text-color="green-9"
              size="sm"
              clickable
              @click="openWebsite(startup.website)"
            >
              <q-icon name="language" size="xs" class="q-mr-xs" />
              Website
            </q-chip>
          </div>
        </q-item-section>

        <!-- Actions -->
        <q-item-section side class="startup-actions">
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="edit"
            size="sm"
            @click="handleEdit(startup)"
          >
            <q-tooltip>Edit Startup</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            color="negative"
            icon="delete"
            size="sm"
            @click="handleDelete(startup)"
          >
            <q-tooltip>Delete Startup</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'

defineProps({
  startups: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) => {
      return value.every((startup) => startup && typeof startup === 'object' && 'id' in startup)
    },
  },
})

const emit = defineEmits(['edit-startup', 'delete-startup'])

function handleEdit(startup) {
  console.log('✏️ Edit startup:', startup.id)
  emit('edit-startup', startup)
}

function handleDelete(startup) {
  console.log('🗑️ Delete startup:', startup.id)
  emit('delete-startup', startup)
}

function openWebsite(url) {
  if (!url) return

  // Ensure URL has protocol
  const formattedUrl = url.startsWith('http') ? url : `https://${url}`
  window.open(formattedUrl, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.empty-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.startup-card {
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.startup-card:hover {
  border-color: var(--q-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.startup-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 60px;
}

/* Responsive */
@media (max-width: 600px) {
  .startup-actions {
    flex-direction: row;
    min-width: auto;
  }
}
</style>
