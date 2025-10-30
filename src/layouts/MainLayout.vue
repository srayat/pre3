<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <q-header class="text-h5 row justify-center app-max-width" style="height: 44px; margin: 0 auto;">
      Pre3.0
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

const route = useRoute()

const showBottomNav = computed(() => route.meta?.hideBottomNav !== true)
</script>

<style scoped>
.app-layout {
  background: linear-gradient(180deg, #f0f4f8 0%, #dfe7f1 100%);
  display: flex;
  justify-content: center;
}

.app-shell {
  width: 100%;
  max-width: 580px;
  min-height: 100vh;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(15, 35, 95, 0.22);
  background: #ffffff;
  display: flex;
  flex-direction: column;

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
  .app-shell {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  .app-shell__pages > .q-page {
    padding: 0 env(safe-area-inset-left, 0) calc(96px + env(safe-area-inset-bottom, 0))
      env(safe-area-inset-right, 0);
  }
}
</style>
