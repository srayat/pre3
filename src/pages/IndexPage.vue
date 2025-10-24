<template>
  <q-page class="landing-page column items-center justify-center text-white">
    <div class="text-h2 text-weight-bold q-mb-md">Pre</div>
    <q-btn
      label="Get Started"
      color="white"
      text-color="grey-9"
      unelevated
      class="q-px-lg q-py-sm"
      @click="goToSignIn"
    />
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToSignIn() {
  router.push('/sign-in')
}
</script>

<style scoped>
.landing-page {
  min-height: 100%;
  background-color: #003153; /* Prussian blue */
}
</style>
