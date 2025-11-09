<template>
  <q-page class="notifications-page column q-pa-lg">
    <div class="text-h5 text-weight-bold text-primary q-pt-lg">Notifications</div>
    <div class="text-body1 text-grey-7 q-mb-lg">
      You will see important updates and reminders here.
    </div>

    <!-- Empty State -->
    <div
      v-if="notifications.length === 0"
      class="notifications-empty column items-center justify-center flex-1"
    >
      <q-icon name="notifications_none" color="primary" size="48px" class="q-mb-sm" />
      <div class="text-subtitle1 text-primary text-weight-medium">All quiet for now</div>
      <div class="text-body2 text-grey-7 text-center q-mt-xs">
        We will notify you as soon as there is something that needs your attention.
      </div>
    </div>

    <!-- Notifications List -->
    <q-list v-else>
      <q-item
        class="q-mb-sm"
        v-for="n in notifications"
        :key="n.id"
        clickable
        @click="markAsRead(n)"
        :class="n.read ? 'bg-white' : 'bg-blue-1'"
      >
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ n.title }}</q-item-label>
          <q-item-label caption class="text-grey-8 q-mt-xs">
            {{ n.message }}
          </q-item-label>
          <q-item-label caption class="text-grey-6 q-mt-xs">
            {{ formatDate(n.createdAt) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-badge v-if="!n.read" color="red" rounded>new</q-badge>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from 'boot/firebase'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  doc,
  updateDoc,
} from 'firebase/firestore'

const router = useRouter()
const notifications = ref([])
let unsubscribeAuth = null
let unsubscribeNotifications = null

// ✅ Format Firestore timestamps
function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

// ✅ Mark notifications as read when user clicks or views them
async function markAsRead(notification) {
  const user = auth.currentUser
  if (!user || !notification || notification.read) return

  const notifPath = `users/${user.uid}/notifications/${notification.id}`
  console.log('→ Marking as read at path:', notifPath)

  try {
    const notifRef = doc(db, notifPath)
    await updateDoc(notifRef, { read: true })
    console.log('✅ Successfully updated Firestore:', notifPath)
    notification.read = true
  } catch (err) {
    console.error('❌ Error marking notification as read:', err)
  }
}

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.replace('/sign-in')
      return
    }

    const notifRef = collection(db, `users/${user.uid}/notifications`)
    const q = query(notifRef, orderBy('createdAt', 'desc'))

    let hasMarkedRead = false // 🔹 prevent repeated marking

    unsubscribeNotifications = onSnapshot(q, async (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      notifications.value = docs

      // 🔹 only mark unread notifications once (first load)
      if (!hasMarkedRead) {
        const unreadDocs = docs.filter((n) => !n.read)
        if (unreadDocs.length > 0) {
          const batch = writeBatch(db)
          unreadDocs.forEach((n) => {
            batch.update(doc(db, `users/${user.uid}/notifications/${n.id}`), { read: true })
          })
          await batch.commit()
        }
        hasMarkedRead = true // ✅ prevent infinite loop
      }
    })
  })
})

onBeforeUnmount(() => {
  unsubscribeAuth?.()
  unsubscribeNotifications?.()
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

.notification-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 0;
}
</style>
