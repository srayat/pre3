<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <div class="app-layout__background">
      <div class="app-layout__frame">
        <q-page-container class="app-layout__pages">
          <router-view />
        </q-page-container>

        <AppBottomNav v-if="showBottomNav" />
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
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.app-layout__frame {
  width: 100%;
  max-width: 420px;
  min-height: calc(100vh - 64px);
  max-height: 840px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(15, 35, 95, 0.22);
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.app-layout__pages {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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
