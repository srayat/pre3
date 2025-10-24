<template>
  <q-page class="notifications-page column q-pa-lg">
    <div class="text-h5 text-weight-bold text-primary q-mb-sm">Alerts</div>
    <div class="text-body1 text-grey-7 q-mb-lg">
      You will see important updates and reminders here.
    </div>

    <div class="notifications-empty column items-center justify-center flex-1">
      <q-icon name="notifications_none" color="primary" size="48px" class="q-mb-sm" />
      <div class="text-subtitle1 text-primary text-weight-medium">All quiet for now</div>
      <div class="text-body2 text-grey-7 text-center q-mt-xs">
        We will notify you as soon as there is something that needs your attention.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'boot/firebase'

const router = useRouter()
let unsubscribe = () => {}

onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.replace('/sign-in')
    }
  })
})

onBeforeUnmount(() => {
  unsubscribe()
})
</script>

<style scoped>
.notifications-page {
  min-height: 100%;
  background: linear-gradient(180deg, #f4f7fb 0%, #ffffff 80%);
  padding-bottom: 96px;
}

.notifications-empty {
  flex: 1;
  border-radius: 18px;
  background: rgba(48, 113, 198, 0.08);
  padding: 48px 32px;
}
</style>
