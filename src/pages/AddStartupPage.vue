<template>
  <q-page class="q-pa-md column justify-start">
    <div class="row justify-between items-center q-mx-auto full-width q-mt-lg q-mb-xl">
      <div>
        <q-btn flat color="primary" icon="arrow_back" label="" class="" to="/more" />
      </div>
      <div class="text-h6">Add a Startup</div>
      <div class="q-px-lg"></div>
    </div>

    <div class="q-mx-auto" style="max-width: 500px; width: 100%">
      <AddStartupForm @startup-added="handleStartupAdded" />
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
