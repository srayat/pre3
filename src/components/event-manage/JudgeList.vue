<template>
  <div>
    <div v-if="judges.length === 0" class="empty-state">
      <q-icon name="gavel" color="primary" size="38px" class="q-mb-sm" />
      <div class="text-body2 text-grey-7 text-center">
        No judges added yet. Add the experts who will review your event.
      </div>
    </div>

    <q-list v-else bordered separator class="rounded-borders q-mb-md">
      <q-item v-for="judge in judges" :key="judge.id">
        <q-item-section avatar>
          <q-icon name="military_tech" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">
            {{ judge.firstName }} {{ judge.lastName }}
          </q-item-label>
          <q-item-label caption>{{ judge.emailDisplay || judge.email }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge
            :color="judge.status === 'registered' ? 'positive' : 'grey-5'"
            class="text-weight-medium"
          >
            {{ judge.status }}
          </q-badge>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
export default {
  name: 'JudgeList',
  props: {
    judges: {
      type: Array,
      default: () => []
    }
  }
}
</script>