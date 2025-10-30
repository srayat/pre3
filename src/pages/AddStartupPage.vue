<template>
  <q-page class="q-pa-md flex flex-center">
    <div class="q-pa-lg q-mx-auto" style="max-width: 500px; width: 100%">
      <h5 class="text-center q-mb-md">Add a Startup</h5>

      <AddStartupForm @startup-added="handleStartupAdded" />

      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Back to More"
        class="q-mt-lg full-width"
        to="/more"
      />
    </div>
  </q-page>
</template>

<script setup>
import AddStartupForm from 'components/AddStartupForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleStartupAdded(newStartupId) {
  // navigate to the startup detail page, or show confirmation
  router.push(`/startup/${newStartupId}`)
}
</script>
