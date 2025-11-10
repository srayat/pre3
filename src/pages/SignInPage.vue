<template>
  <q-page class="sign-in-page flex flex-center q-pa-md">
    <q-card class="sign-in-card q-pa-lg" flat bordered>
      <div class="text-h5 text-weight-bold text-primary q-mb-xs">
        {{ cardTitle }}
      </div>
      <div class="text-body1 text-grey-7 q-mb-lg">
        {{ cardMessage }}
      </div>
      <q-form @submit.prevent="handleSubmit" class="column q-gutter-md">
        <q-input
          v-model="email"
          type="email"
          label="Email"
          outlined
          dense
          autocomplete="email"
          :disable="loading"
          :rules="emailRules"
        />

        <q-btn
          type="submit"
          color="primary"
          class="q-py-sm"
          :label="buttonLabel"
          :loading="loading"
          unelevated
          no-caps
        />
      </q-form>

      <q-banner
        v-if="state.awaitingEmailForLink"
        rounded
        class="bg-grey-2 text-grey-8 text-body1 q-mt-md"
      >
        Enter the same email address you used to request the sign-in link, then select
        <span class="text-weight-medium">Complete Sign-In</span>.
      </q-banner>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'
import { normalizeEmail, isValidEmail } from 'src/utils/normalizeEmail'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const email = ref('')
const state = reactive({
  mode: 'request', // 'request' | 'complete'
  sending: false,
  completing: false,
  awaitingEmailForLink: false,
})

const emailStorageKey = 'pre3-emailForSignIn'

const emailRules = [(val) => (!!val && isValidEmail(val)) || 'Enter a valid email address']

const loading = computed(() => state.sending || state.completing)
const buttonLabel = computed(() =>
  state.mode === 'request' ? 'Send Sign-In Link' : 'Complete Sign-In',
)

const cardTitle = computed(() =>
  state.mode === 'request' ? 'Passwordless Sign-In' : 'Finish Signing In',
)

const cardMessage = computed(() => {
  if (state.mode === 'request') {
    return 'Enter your email address and we will email you a secure link to sign in.'
  }
  return 'Open the link we emailed to you. If prompted, confirm the address you used so we can complete your sign-in.'
})

// To dynamically switch between dev/localhost and prod
function getContinuationUrl() {
  if (typeof window === 'undefined') return 'https://premoney.com/verify-email'

  // Check if we're in development
  const isDev =
    import.meta.env.MODE === 'development' ||
    import.meta.env.DEV === true ||
    window.location.hostname === 'localhost' ||
    window.location.port === '9000'

  if (isDev) {
    // For localhost, use hash routing (more reliable)
    const { protocol, host } = window.location
    return `${protocol}//${host}/verify-email`
  }

  // Production
  return 'https://premoney.com/verify-email'
}

async function handleSubmit() {
  if (state.mode === 'complete') {
    await completeSignIn()
    return
  }
  await sendLink()
}

async function sendLink() {
  if (!email.value) {
    $q.notify({ type: 'warning', message: 'Please enter an email address.' })
    return
  }

  try {
    state.sending = true
    const normalizedEmail = normalizeEmail(email.value)

    await sendSignInLinkToEmail(auth, normalizedEmail, {
      url: getContinuationUrl(), // Use the function here
      handleCodeInApp: true,
    })

    window.localStorage.setItem(emailStorageKey, normalizedEmail)

    // Also save redirect URL if exists
    if (route.query.redirect) {
      window.localStorage.setItem('pre3-redirectAfterSignIn', route.query.redirect)
    }

    $q.notify({
      type: 'positive',
      message: 'Sign-in link sent! Check your inbox to continue.',
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Unable to send the sign-in link. Please try again.',
    })
  } finally {
    state.sending = false
  }
}

async function completeSignIn() {
  if (typeof window === 'undefined') return

  const normalizedEmail = normalizeEmail(email.value)

  if (!normalizedEmail) {
    state.awaitingEmailForLink = true
    $q.notify({
      type: 'warning',
      message: 'Enter the email you used when requesting the sign-in link.',
    })
    return
  }

  try {
    state.completing = true
    const userCredential = await signInWithEmailLink(auth, normalizedEmail, window.location.href)
    const { user } = userCredential

    if (!user?.uid) throw new Error('Missing user details after sign-in.')

    const userDocRef = doc(db, 'users', user.uid)
    const userDocSnap = await getDoc(userDocRef)

    window.localStorage.removeItem(emailStorageKey)
    state.awaitingEmailForLink = false
    state.mode = 'request'
    email.value = ''

    $q.notify({ type: 'positive', message: 'Signed in successfully.' })

    const redirectParam = Array.isArray(route.query.redirect)
      ? route.query.redirect[0]
      : route.query.redirect
    const target =
      userDocSnap.exists() && typeof redirectParam === 'string' && redirectParam.startsWith('/')
        ? redirectParam
        : userDocSnap.exists()
          ? '/home'
          : '/profile-onboarding'

    await router.push(target)
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'We could not complete your sign-in. Request a new link and try again.',
    })
  } finally {
    state.completing = false
  }
}

onMounted(async () => {
  if (typeof window === 'undefined') return

  const isEmailLink = isSignInWithEmailLink(auth, window.location.href)
  if (!isEmailLink) return

  state.mode = 'complete'
  const storedEmail = window.localStorage.getItem(emailStorageKey)

  if (storedEmail) {
    email.value = storedEmail
    await completeSignIn()
    return
  }

  state.awaitingEmailForLink = true
  $q.notify({
    type: 'info',
    message: 'Almost there! Confirm the email you used for the link to finish signing in.',
  })
})
</script>

<style scoped>
.sign-in-page {
  min-height: 100%;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 80%);
}

.sign-in-card {
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
}
</style>
