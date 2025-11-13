<template>
  <q-page class="more-page column q-pa-lg bg-blue-grey-1">
    <div class="text-h5 text-weight-bold text-primary q-pt-lg">More</div>
    <div class="text-body1 text-grey-7 q-mb-lg">Quick actions and settings.</div>

    <q-card flat bordered class="actions-card">
      <q-list separator>
        <q-item v-for="action in actions" :key="action.key" clickable @click="handleAction(action)">
          <q-item-section avatar>
            <q-icon :name="action.icon" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium text-subtitle1 q-pt-sm">{{
              action.label
            }}</q-item-label>
            <q-item-label class="text-subtitle2 text-grey-7 q-pb-sm">{{
              action.caption
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey-7" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Add Bug Report Button -->
    <q-list flat bordered class="actions-card q-mt-xl bg-white">
      <q-item clickable @click="showBugReportDialog = true">
        <q-item-section avatar>
          <q-icon name="bug_report" color="negative" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium text-subtitle1 q-pt-sm"
            >Report a Bug</q-item-label
          >
          <q-item-label class="text-subtitle2 text-grey-7 q-pb-sm"
            >Help us improve your experience</q-item-label
          >
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" color="grey-5" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Bug Report Dialog -->
    <BugReportDialog v-model="showBugReportDialog" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from 'boot/firebase'
import { doc, getDoc } from 'firebase/firestore'
import BugReportDialog from 'components/BugReportDialog.vue'

const showBugReportDialog = ref(false)
const router = useRouter()
const $q = useQuasar()

const actions = [
  {
    key: 'create-event',
    icon: 'event_available',
    label: 'Create an Event',
    caption: 'Set up a new pitch or activity',
  },
  {
    key: 'edit-profile',
    icon: 'manage_accounts',
    label: 'Edit Profile',
    caption: 'Update your personal details',
  },
  {
    key: 'create-startup',
    icon: 'rocket_launch',
    label: 'Add a Startup Page',
    caption: 'Launch your startup profile',
  },
  {
    key: 'logout',
    icon: 'logout',
    label: 'Log Out',
    caption: 'Sign out of your account',
  },
]

let unsub = () => {}

onMounted(() => {
  unsub = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.replace('/sign-in')
    }
  })
})

onBeforeUnmount(() => {
  unsub()
})

async function handleAction(action) {
  if (action.key === 'create-event') {
    await handleCreateEvent()
    return
  }

  if (action.key === 'logout') {
    try {
      await signOut(auth)
      $q.notify({ type: 'info', message: 'You have been signed out.' })
      await router.replace('/sign-in')
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Sign-out failed. Please try again.' })
    }
    return
  }

  if (action.key === 'edit-profile') {
    await router.push('/user-profile')
    return
  }

  if (action.key === 'create-startup') {
    await router.push('/add-startup')
    return
  }

  $q.notify({
    type: 'info',
    message: 'This feature is coming soon!',
  })
}

async function handleCreateEvent() {
  if (!auth.currentUser) {
    await router.replace('/sign-in')
    return
  }

  try {
    const userDocRef = doc(db, 'users', auth.currentUser.uid)
    const snapshot = await getDoc(userDocRef)
    const eventBalance = snapshot.data()?.hostingAccount?.eventBalance ?? 0

    if (eventBalance >= 0) {
      await router.push('/events/new')
      return
    }

    $q.dialog({
      title: 'Upgrade Required',
      message: 'You need to upgrade your plan to create more events.',
      ok: {
        label: 'Okay',
        color: 'primary',
        unelevated: true,
      },
      cancel: {
        label: 'Not now',
        flat: true,
        color: 'grey-7',
      },
      persistent: true,
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Unable to verify your event balance. Please try again.',
    })
  }
}
</script>

<style scoped>
.more-page {
  min-height: 100%;
  background: linear-gradient(180deg, #f9fbff 0%, #ffffff 85%);
  padding-bottom: 96px;
}

.actions-card {
  border-radius: 8px;
}
</style>
