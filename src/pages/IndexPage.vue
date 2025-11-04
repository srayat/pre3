<template>
  <q-page class="landing-page column items-center justify-center text-white">
    <div class="text-h1 text-weight-bold splash-title">PRE</div>
    <div class="text-h3 text-weight-bold splash-subtitle">Gamified Startup Investing</div>
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
  background:
    radial-gradient(ellipse at 20% 10%, rgba(25, 55, 95, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 90%, rgba(30, 60, 100, 0.3) 0%, transparent 50%),
    linear-gradient(145deg, #000d1a 0%, #001829 30%, #00213d 60%, #001420 100%);

  /* Glassmorphic effect */
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);

  /* Refined border and depth */
  border: 1px solid rgba(100, 150, 200, 0.12);
  border-radius: 24px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0 80px rgba(15, 45, 75, 0.3);

  color: #f0f4f8;
  text-align: center;
}

/* Static light accent (no animation) */
.landing-page::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(70, 120, 180, 0.15) 0%,
    rgba(40, 80, 130, 0.08) 40%,
    transparent 70%
  );
  filter: blur(60px);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
}

/* Secondary light accent */
.landing-page::after {
  content: '';
  position: absolute;
  bottom: -15%;
  left: -5%;
  width: 250px;
  height: 250px;
  background: radial-gradient(
    circle,
    rgba(50, 100, 150, 0.12) 0%,
    rgba(30, 70, 110, 0.06) 40%,
    transparent 70%
  );
  filter: blur(50px);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
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
  opacity: 0.97;
  margin-top: 0px;
  margin-bottom: 1.5em;
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
