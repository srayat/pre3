<template>
  <div class="app-bottom-nav bg-white text-primary">
    <q-bottom-navigation>
      <q-tabs
        class="full-width app-bottom-nav__tabs"
        align="justify"
        no-caps
        active-color="primary"
      >
        <q-route-tab
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :name="item.to"
          :icon="item.icon"
          :label="item.label"
          exact
        >
          <!-- 🔹 Show unread badge only on Alerts tab -->
          <template v-if="item.to === '/notifications'" #default>
            <q-badge v-if="unreadCount > 0" color="red" floating rounded :label="unreadCount" />
          </template>
        </q-route-tab>
      </q-tabs>
    </q-bottom-navigation>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db, auth } from 'boot/firebase'

const navItems = [
  { to: '/home', icon: 'home', label: 'Home' },
  { to: '/events', icon: 'event_note', label: 'My Events' },
  { to: '/notifications', icon: 'notifications', label: 'Alerts' },
  { to: '/more', icon: 'more_horiz', label: 'More' },
]

// 🔹 Reactive unread count
const unreadCount = ref(0)
let unsubscribe = null

onMounted(() => {
  const user = auth.currentUser
  if (!user) return

  // Query all unread notifications for this user
  const q = query(collection(db, `users/${user.uid}/notifications`), where('read', '==', false))

  unsubscribe = onSnapshot(q, (snapshot) => {
    unreadCount.value = snapshot.size
  })
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style lang="scss" scoped>
.app-bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--app-max-width);
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -8px 18px rgba(15, 35, 95, 0.08);
  border-radius: 8px 8px 0 0;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0));
  box-sizing: border-box;
  z-index: 1000;
}

.app-bottom-nav__tabs .q-tab__content {
  min-height: 54px;
}

.app-bottom-nav__tabs .q-tab__icon {
  font-size: 22px;
}

.app-bottom-nav__tabs .q-tab__label {
  font-weight: 600;
  font-size: 13px;
}

:deep(.q-tab__label) {
}

@media (max-width: 520px) {
  .app-bottom-nav {
    max-width: 100%;
    border-radius: 0;
    padding: 8px env(safe-area-inset-right, 0) calc(8px + env(safe-area-inset-bottom, 0))
      env(safe-area-inset-left, 0);
  }
}
</style>
