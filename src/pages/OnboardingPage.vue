<template>
  <q-page class="onboarding-page flex flex-center q-pa-md">
    <q-card class="onboarding-card column q-pa-lg q-gutter-md" flat bordered>
      <div class="text-h5 text-weight-bold text-primary">Welcome! Just one more step.</div>
      <div class="text-body2 text-grey-7">
        Tell us how to address you and we will take you straight to the app.
      </div>

      <q-form @submit.prevent="handleSubmit" class="column q-gutter-md">
        <q-input
          v-model="firstName"
          label="First Name"
          outlined
          dense
          :rules="nameRules"
          autocomplete="given-name"
          :disable="loading"
        />
        <q-input
          v-model="lastName"
          label="Last Name"
          outlined
          dense
          :rules="nameRules"
          autocomplete="family-name"
          :disable="loading"
        />

        <q-btn
          type="submit"
          color="primary"
          label="Save and Continue"
          :loading="loading"
          unelevated
          class="q-py-sm"
          no-caps
        />
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'

const router = useRouter()
const $q = useQuasar()

const firstName = ref('')
const lastName = ref('')
const loading = ref(false)
const nameRules = [(val) => (!!val && val.trim().length > 0) || 'This field is required']

async function redirectIfProfileExists(user) {
  const profileRef = doc(db, 'users', user.uid)
  const profileSnap = await getDoc(profileRef)

  if (profileSnap.exists() && profileSnap.data()?.firstName && profileSnap.data()?.lastName) {
    await router.replace('/home')
  }
}

async function handleSubmit() {
  if (!auth.currentUser?.uid) {
    $q.notify({ type: 'negative', message: 'Your session expired. Please sign in again.' })
    await router.replace('/sign-in')
    return
  }

  const trimmedFirst = firstName.value.trim()
  const trimmedLast = lastName.value.trim()

  if (!trimmedFirst || !trimmedLast) {
    $q.notify({ type: 'warning', message: 'Please provide both your first and last name.' })
    return
  }

  try {
    loading.value = true
    const profileRef = doc(db, 'users', auth.currentUser.uid)
    const existingProfile = await getDoc(profileRef)
    const payload = {
      firstName: trimmedFirst,
      lastName: trimmedLast,
      email: auth.currentUser.email || '',
      updatedAt: serverTimestamp(),
    }

    if (!existingProfile.exists()) {
      payload.createdAt = serverTimestamp()
    }

    await setDoc(profileRef, payload, { merge: true })

    $q.notify({ type: 'positive', message: 'Profile saved. Welcome aboard!' })
    await router.replace('/home')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'We could not save your details. Please try again.',
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.currentUser) {
    await router.replace('/sign-in')
    return
  }

  await redirectIfProfileExists(auth.currentUser)
})
</script>

<style scoped>
.onboarding-page {
  min-height: 100%;
  background: linear-gradient(180deg, #eef2f7 0%, #ffffff 90%);
}

.onboarding-card {
  max-width: 480px;
  width: 100%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
}
</style>
