<template>
  <q-page class="profile-onboarding-page column items-center justify-center q-pa-md">
    <div class="onboarding-card q-pa-lg">
      <div class="text-h4 text-weight-bold q-mb-md text-center">Complete Your Profile</div>
      <div class="text-body1 text-grey-7 q-mb-lg text-center">Tell us a bit about yourself</div>

      <q-form @submit="saveProfile" class="q-gutter-md">
        <q-input
          v-model="firstName"
          label="First Name"
          outlined
          :rules="[(val) => !!val || 'First name is required']"
        />

        <q-input
          v-model="lastName"
          label="Last Name"
          outlined
          :rules="[(val) => !!val || 'Last name is required']"
        />

        <q-btn
          type="submit"
          label="Continue"
          color="primary"
          unelevated
          size="lg"
          class="full-width q-mt-lg"
          :loading="loading"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { doc, updateDoc } from 'firebase/firestore'
import { db, auth } from 'boot/firebase'
import { Notify } from 'quasar'

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const loading = ref(false)

async function saveProfile() {
  if (!auth.currentUser) return

  loading.value = true
  try {
    const userRef = doc(db, 'users', auth.currentUser.uid)
    await updateDoc(userRef, {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      profileComplete: true,
      updatedAt: new Date(),
    })

    Notify.create({
      message: 'Profile saved!',
      color: 'positive',
      icon: 'check_circle',
    })

    router.replace('/home')
  } catch (error) {
    console.error('Error saving profile:', error)
    Notify.create({
      message: 'Failed to save profile',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-onboarding-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.onboarding-card {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
</style>
