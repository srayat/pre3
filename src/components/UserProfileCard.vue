<template>
  <q-card flat bordered class="q-pa-md" style="max-width: 450px; width: 100%">
    <!-- Profile Picture -->
    <div class="text-center q-mb-md">
      <q-avatar
        size="100px"
        class="q-mb-sm cursor-pointer relative-position"
        @click="triggerFileInput"
      >
        <img :src="form.photoURL || userPic" alt="User avatar" />

        <q-btn
          dense
          round
          flat
          icon="camera_alt"
          color="white"
          class="absolute-bottom-right bg-primary"
          size="sm"
        />
      </q-avatar>

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileUpload"
      />

      <!-- Upload progress -->
      <div v-if="uploadProgress > 0" class="q-mt-sm">
        <q-linear-progress :value="uploadProgress / 100" color="primary" rounded animated />
        <div class="text-caption text-grey-7 q-mt-xs">
          Uploading: {{ Math.round(uploadProgress) }}%
        </div>
      </div>

      <div class="text-h6 q-mt-md">{{ displayName }}</div>
      <div class="text-subtitle2 text-grey-7">{{ form.email }}</div>
      <div class="text-caption text-grey-6 q-mt-xs">Member since: {{ form.memberSince }}</div>
    </div>

    <q-separator spaced />

    <q-form @submit.prevent="saveProfile">
      <q-input
        filled
        v-model="form.firstName"
        label="First Name"
        :disable="!editMode"
        class="q-mb-md"
      />
      <q-input
        filled
        v-model="form.lastName"
        label="Last Name"
        :disable="!editMode"
        class="q-mb-md"
      />
      <q-input
        filled
        v-model="form.description"
        label="Description"
        type="textarea"
        autogrow
        :disable="!editMode"
        class="q-mb-md"
      />
      <q-input filled v-model="form.email" label="Email" disable class="q-mb-md" />

      <div class="row justify-end q-gutter-sm">
        <q-btn v-if="!editMode" label="Edit" color="primary" @click="editMode = true" />
        <q-btn v-else label="Save" color="primary" type="submit" :loading="saving" />
        <q-btn v-if="editMode" label="Cancel" flat color="grey" @click="cancelEdit" />
      </div>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { auth, db } from 'boot/firebase'
import { Notify } from 'quasar'
import userPic from 'assets/user-icon-grey.png'

const fileInput = ref(null)
const uploadProgress = ref(0)
const editMode = ref(false)
const saving = ref(false)
const userDocRef = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  description: '',
  email: '',
  photoURL: '',
  memberSince: '',
})

const displayName = computed(() =>
  [form.value.firstName, form.value.lastName].filter(Boolean).join(' '),
)

// Fetch user data on mount
onMounted(async () => {
  const currentUser = auth.currentUser
  if (!currentUser) return

  userDocRef.value = doc(db, 'users', currentUser.uid)
  const snap = await getDoc(userDocRef.value)

  if (snap.exists()) Object.assign(form.value, snap.data())

  form.value.email = currentUser.email
  form.value.memberSince = new Date(currentUser.metadata.creationTime).toLocaleDateString()
})

// Save profile fields
async function saveProfile() {
  try {
    saving.value = true
    await updateDoc(userDocRef.value, {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      description: form.value.description,
    })
    editMode.value = false
    Notify.create({ type: 'positive', message: 'Profile updated successfully' })
  } catch (err) {
    console.error(err)
    Notify.create({ type: 'negative', message: 'Error updating profile' })
  } finally {
    saving.value = false
  }
}

// Cancel edit
function cancelEdit() {
  editMode.value = false
  onMounted()
}

// Trigger file picker
function triggerFileInput() {
  fileInput.value.click()
}

// Upload photo with progress
async function handleFileUpload(event) {
  const file = event.target.files[0]
  console.log('📸 File selected:', file) // debug
  if (!file) return
  console.warn('No file selected') // debug
  const currentUser = auth.currentUser
  console.log('👤 Current user:', currentUser?.uid) // debug

  try {
    const storage = getStorage()
    const imageRef = storageRef(storage, `users/${currentUser.uid}/profile.jpg`)
    console.log('🚀 Uploading to:', imageRef.fullPath) // debug
    const uploadTask = uploadBytesResumable(imageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log('Progress:', uploadProgress.value) // debug
      },
      (error) => {
        console.error('❌ Upload error:', error)
        Notify.create({ type: 'negative', message: 'Upload failed' })
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        console.log('✅ Upload complete:', url) // debug
        await updateDoc(userDocRef.value, { photoURL: url })
        form.value.photoURL = url
        uploadProgress.value = 0
        Notify.create({ type: 'positive', message: 'Profile picture updated!' })
      },
    )
  } catch (err) {
    console.error(err)
    Notify.create({ type: 'negative', message: 'Error uploading image' })
  } finally {
    event.target.value = ''
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.q-avatar img {
  object-fit: cover;
}
</style>
