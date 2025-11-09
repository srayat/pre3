<template>
  <q-page class="landing-page column items-center justify-center text-white">
    <div class="splash">
      <img :src="logoUrl" alt="Pre3 Logo" class="logo-image" />
    </div>
    <div class="text-body1 splash-subtitle">Gamified Startup Investing</div>
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
import logoUrl from 'assets/logo_small_white.png'

const router = useRouter()

function goToSignIn() {
  router.push('/sign-in')
}
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 600px;
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  padding: 2rem;
  position: relative;

  /* Deep dark prussian blue with strategic lighter areas */

  background: #172b40;
  background: linear-gradient(
    315deg,
    rgba(23, 43, 64, 1) 15%,
    rgba(8, 15, 61, 1) 50%,
    rgba(7, 16, 36, 1) 87%
  );

  color: #f0f4f8;
  text-align: center;
}

/* Crisp white title */
.splash-title {
  font-size: 2.8rem;
  font-weight: 700;
  letter-spacing: 4px;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 0px;
  line-height: 0.8em;
}

/* Subtitle styling */
.splash-subtitle {
  font-size: 1.1rem;
  color: #d4e4f0;
  margin-top: 10px;
  margin-bottom: 3em;
  letter-spacing: 3px;
}

/* Description text */
.splash-description {
  font-size: 0.95rem;
  color: #b8d4e6;
  opacity: 0.85;
  line-height: 1.6;
}
</style>
