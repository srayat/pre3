
<template>
  <div class="app-bottom-nav bg-white text-primary">
    <q-tabs class="full-width app-bottom-nav__tabs" align="justify" no-caps active-color="primary">
      <q-route-tab
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :name="item.to"
        :icon="item.icon"
        :label="item.label"
        exact
      />
    </q-tabs>
  </div>
</template>

<script setup>
const navItems = [
  { to: '/home', icon: 'home', label: 'Home' },
  { to: '/events', icon: 'event_note', label: 'My Events' },
  { to: '/notifications', icon: 'notifications', label: 'Alerts' },
  { to: '/more', icon: 'more_horiz', label: 'More' },
]
</script>

<style scoped>
.app-bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -8px 18px rgba(15, 35, 95, 0.08);
  border-radius: 18px 18px 0 0;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  z-index: 1000;
}

.app-bottom-nav__tabs .q-tab__content {
  min-height: 64px;
}

.app-bottom-nav__tabs .q-icon {
  font-size: 22px;
  color: #888;
}

.app-bottom-nav__tabs .q-tab__label {
  font-weight: 600;
  font-size: 13px;
  color: #bbb;
}

@media (max-width: 480px) {
  .app-bottom-nav {
    max-width: 100%;
    border-radius: 0;
    padding: 8px env(safe-area-inset-right, 0) calc(8px + env(safe-area-inset-bottom, 0))
      env(safe-area-inset-left, 0);
  }
}

</style>
