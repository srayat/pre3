<template>
  <q-page class="verify-email-page flex flex-center q-pa-md">
    <q-card class="verify-card q-pa-lg" flat bordered>
      <!-- Loading State -->
      <div v-if="isVerifying" class="column items-center q-gutter-md">
        <q-spinner-hourglass color="primary" size="60px" />
        <div class="text-h5 text-weight-medium">Verifying your email...</div>
        <div class="text-body2 text-grey-7">Please wait a moment</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="column items-center q-gutter-md">
        <q-icon name="error_outline" color="negative" size="60px" />
        <div class="text-h5 text-weight-medium text-negative">Verification Failed</div>
        <div class="text-body2 text-grey-7 text-center">{{ error }}</div>
        <q-btn label="Try Again" color="primary" unelevated @click="goToSignIn" class="q-mt-md" />
      </div>

      <!-- Email Input (if email not found) -->
      <div v-else-if="needsEmail" class="column items-center q-gutter-md">
        <div class="text-h5 text-weight-medium text-primary q-mb-xs">Finish Signing In</div>
        <div class="text-body2 text-grey-7 text-center q-mb-md">
          Confirm the email address you used to request the sign-in link
        </div>

        <q-input
          v-model="emailInput"
          type="email"
          label="Email"
          outlined
          dense
          class="full-width"
          :rules="[(val) => (!!val && /.+@.+\..+/.test(val)) || 'Enter a valid email']"
          autocomplete="email"
        />

        <q-btn
          label="Complete Sign-In"
          color="primary"
          unelevated
          no-caps
          @click="completeSignIn"
          :loading="isVerifying"
          class="full-width q-py-sm"
        />
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="column items-center q-gutter-md">
        <q-icon name="check_circle" color="positive" size="60px" />
        <div class="text-h5 text-weight-medium text-positive">Signed in successfully!</div>
        <div class="text-body2 text-grey-7">Taking you to the app...</div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'
import { normalizeEmail } from 'src/utils/normalizeEmail'

const router = useRouter()
const $q = useQuasar()

const isVerifying = ref(true)
const needsEmail = ref(false)
const success = ref(false)
const error = ref('')
const emailInput = ref('')

const emailStorageKey = 'pre3-emailForSignIn'
const redirectStorageKey = 'pre3-redirectAfterSignIn'

const goToSignIn = () => {
  router.push('/sign-in')
}

const completeSignIn = async () => {
  const email = emailInput.value || window.localStorage.getItem(emailStorageKey)

  if (!email) {
    error.value = 'Email address is required'
    needsEmail.value = true
    isVerifying.value = false
    return
  }

  isVerifying.value = true
  error.value = ''
  needsEmail.value = false

  try {
    const normalizedEmail = normalizeEmail(email)
    const url = window.location.href

    // Sign in with the email link
    const userCredential = await signInWithEmailLink(auth, normalizedEmail, url)
    const { user } = userCredential

    if (!user?.uid) throw new Error('Missing user details after sign-in.')

    // Check if user has completed profile
    const userDocRef = doc(db, 'users', user.uid)
    const userDocSnap = await getDoc(userDocRef)

    // Clear stored email
    window.localStorage.removeItem(emailStorageKey)

    // Get redirect URL if exists
    const savedRedirect = window.localStorage.getItem(redirectStorageKey)
    window.localStorage.removeItem(redirectStorageKey)

    success.value = true

    $q.notify({
      type: 'positive',
      message: 'Signed in successfully!',
    })

    // Determine where to redirect
    const target =
      savedRedirect && savedRedirect.startsWith('/')
        ? savedRedirect
        : userDocSnap.exists()
          ? '/home'
          : '/profile-onboarding'

    // Redirect after short delay
    setTimeout(() => {
      router.replace(target)
    }, 1000)
  } catch (err) {
    console.error('Sign-in error:', err)
    isVerifying.value = false

    if (err.code === 'auth/invalid-action-code') {
      error.value = 'This sign-in link has expired or already been used. Please request a new one.'
    } else if (err.code === 'auth/invalid-email') {
      error.value = 'Invalid email address. Please try again.'
    } else {
      error.value = 'Could not complete sign-in. Request a new link and try again.'
    }
  }
}

onMounted(async () => {
  // Check if the URL is actually a sign-in link
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    error.value = 'Invalid sign-in link. Please request a new one.'
    isVerifying.value = false
    return
  }

  // Try to get the email from local storage
  const savedEmail = window.localStorage.getItem(emailStorageKey)

  if (savedEmail) {
    // If we have the email, complete sign-in automatically
    emailInput.value = savedEmail
    await completeSignIn()
  } else {
    // If no email found, ask user to input it
    isVerifying.value = false
    needsEmail.value = true
  }
})
</script>

<style scoped>
.verify-email-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 80%);
}

.verify-card {
  max-width: 420px;
  width: 100%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
}
</style>
