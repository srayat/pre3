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
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -8px 18px rgba(15, 35, 95, 0.08);
  flex-shrink: 0;
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
</style>
