<template>
  <q-page class="q-pa-md">
    <h5 class="q-mb-md">Edit Startup</h5>

    <q-form @submit.prevent="saveStartup" class="q-gutter-md" v-if="!loading">
      <q-input
        v-model="name"
        label="Startup Name"
        outlined
        :rules="[val => !!val || 'Name is required']"
      />
      <q-input v-model="industry" label="Industry" outlined />
      <q-input v-model="website" label="Website" outlined />
      <q-input
        v-model="description"
        label="Description"
        type="textarea"
        outlined
      />

      <div class="text-center q-mt-md">
        <q-btn
          type="submit"
          label="Save Changes"
          color="primary"
          :loading="saving"
          icon="save"
        />
        <q-btn
          flat
          color="grey-7"
          class="q-ml-sm"
          label="Cancel"
          @click="goBack"
        />
      </div>
    </q-form>

    <div v-else>Loading...</div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const auth = getAuth()

const id = route.params.id
const loading = ref(true)
const saving = ref(false)
const name = ref('')
const industry = ref('')
const website = ref('')
const description = ref('')

onMounted(async () => {
  const snap = await getDoc(doc(db, 'startups', id))
  if (snap.exists()) {
    const data = snap.data()
    name.value = data.name || ''
    industry.value = data.industry || ''
    website.value = data.website || ''
    description.value = data.description || ''
  }
  loading.value = false
})

async function saveStartup() {
  if (!auth.currentUser) {
    $q.notify({ type: 'negative', message: 'You must be signed in.' })
    return
  }

  saving.value = true

  try {
    const startupRef = doc(db, 'startups', id)
    await updateDoc(startupRef, {
      name: name.value.trim(),
      industry: industry.value.trim(),
      website: website.value.trim(),
      description: description.value.trim(),
      lastModifiedBy: auth.currentUser.uid,
      updatedAt: serverTimestamp()
    })

    $q.notify({
      type: 'positive',
      message: 'Startup updated successfully!'
    })

    router.push(`/startup/${id}`)
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'Failed to update startup.'
    })
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push(`/startup/${id}`)
}
</script>
