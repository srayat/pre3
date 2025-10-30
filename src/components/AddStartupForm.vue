<template>
  <q-form @submit.prevent="addStartup" class="q-gutter-md">
    <q-input
      v-model="name"
      label="Startup Name"
      outlined
      :rules="[val => !!val || 'Name is required']"
    />
    <q-input v-model="description" label="Description" type="textarea" outlined />
    <q-input v-model="industry" label="Industry" outlined />
    <q-input v-model="website" label="Website (optional)" outlined />

    <div class="text-center">
      <q-btn
        type="submit"
        label="Add Startup"
        color="primary"
        icon="add"
        :loading="loading"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// ✅ defineEmits declaration (fixes ESLint 'emit not defined')
const emit = defineEmits(['startup-added'])

const $q = useQuasar()
const auth = getAuth()

const name = ref('')
const description = ref('')
const industry = ref('')
const website = ref('')
const loading = ref(false)

async function addStartup() {
  if (!auth.currentUser) {
    $q.notify({ type: 'negative', message: 'You must be signed in.' })
    return
  }

  loading.value = true

  try {
    const startupRef = await addDoc(collection(db, 'startups'), {
      name: name.value.trim(),
      normalizedName: name.value.trim().toLowerCase(),
      description: description.value.trim(),
      industry: industry.value.trim(),
      website: website.value.trim(),
      createdBy: auth.currentUser.uid,
      owners: [auth.currentUser.uid],
      pendingOwnerEmails: [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastModifiedBy: auth.currentUser.uid
    })

    $q.notify({
      type: 'positive',
      message: 'Startup created successfully!'
    })

    // ✅ Emit event so parent page can redirect
    emit('startup-added', startupRef.id)
  } catch (error) {
    console.error('Error adding startup:', error)
    $q.notify({ type: 'negative', message: 'Failed to add startup.' })
  } finally {
    loading.value = false
  }
}
</script>

