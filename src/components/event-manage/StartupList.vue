<template>
  <div>
    <div v-if="startups.length === 0" class="empty-state">
      <q-icon name="rocket_launch" color="primary" size="38px" class="q-mb-sm" />
      <div class="text-body2 text-grey-7 text-center">
        You have not added any startups yet. Enter the details below to get started.
      </div>
    </div>

    <q-list v-else bordered separator class="rounded-borders q-mb-md">
      <q-item v-for="startup in startups" :key="startup.id">
        <q-item-section avatar>
          <q-icon name="rocket_launch" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">
            {{ startup.startupName || startup.firstName || 'Untitled Startup' }}
          </q-item-label>
          <q-item-label caption>
            {{ startup.emailDisplay || startup.email }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge
            :color="startup.status === 'registered' ? 'positive' : 'grey-5'"
            class="text-weight-medium"
          >
            {{ startup.status }}
          </q-badge>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
export default {
  name: 'StartupList',
  props: {
    startups: {
      type: Array,
      default: () => []
    }
  }
}
</script>