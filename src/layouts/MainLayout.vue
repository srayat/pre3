<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <div class="app-layout__background">
      <div class="app-layout__frame">
        <q-page-container class="app-layout__pages">
          <router-view />
        </q-page-container>

        <div v-if="showBottomNav" class="app-bottom-nav-wrapper">
          <AppBottomNav />
        </div>
      </div>
    </div>
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
}

.app-layout__background {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0 16px;
}

.app-layout__frame {
  width: 100%;
  max-width: 420px;
  height: 100vh;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(15, 35, 95, 0.22);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
}

.app-layout__pages {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 80px;
}

.app-bottom-nav-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

@media (max-width: 480px) {
  .app-layout__background {
    padding: 0;
  }

  .app-layout__frame {
    max-width: 100%;
    max-height: none;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
