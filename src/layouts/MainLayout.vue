<template>
  <q-layout view="lHh lpr lFf" class="app-layout">
    <q-header v-if="showHeader" class="app-header">
      <div class="app-header__content">
        <router-link to="/home" class="logo-link">
          <img :src="logoUrl" alt="Pre3 Logo" class="logo-image" loading="eager" />
        </router-link>
      </div>
    </q-header>
    <div class="app-shell">
      <q-page-container class="app-shell__pages">
        <router-view />
      </q-page-container>
    </div>
    <q-footer>
      <AppBottomNav v-if="showBottomNav" />
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppBottomNav from 'components/AppBottomNav.vue'
import logoUrl from 'assets/logo_small_white.png'

const route = useRoute()

const showBottomNav = computed(() => route.meta?.hideBottomNav !== true)
const showHeader = computed(() => route.meta?.hideHeader !== true)
</script>

<style scoped>
.app-layout {
  background: #172b40;
  background: linear-gradient(
    315deg,
    rgba(23, 43, 64, 1) 15%,
    rgba(8, 15, 61, 1) 50%,
    rgba(7, 16, 36, 1) 87%
  );
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.app-header {
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  box-shadow: none;
}

.app-header__content {
  width: 100%;
  max-width: 580px;
  display: flex;
  align-items: center;
  padding-left: 16px;
  background: var(--q-primary);
  height: 44px;
  border-radius: 6px 6px 0 0;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
  text-decoration: none;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo-link:active {
  opacity: 0.6;
}

.logo-image {
  height: 30px;
  width: auto;
  display: block;
}

.app-shell {
  width: 100%;
  max-width: 580px;
  min-height: 100vh;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(15, 35, 95, 0.22);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.app-shell__pages {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.app-shell__pages > .q-page {
  min-height: auto;
  padding: 0 16px calc(96px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
}

@media (max-width: 480px) {
  .app-header__content {
    border-radius: 0;
  }

  .app-shell {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
    box-sizing: border-box;
  }

  .app-shell__pages > .q-page {
    padding: 0 calc(16px + env(safe-area-inset-left, 0)) calc(96px + env(safe-area-inset-bottom, 0))
      calc(16px + env(safe-area-inset-right, 0));
  }
}
</style>
