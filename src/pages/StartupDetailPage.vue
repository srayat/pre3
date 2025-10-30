<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <h5>{{ startup?.name || 'Loading...' }}</h5>
      <q-btn
        v-if="canEdit"
        color="primary"
        icon="edit"
        label="Edit"
        @click="goToEdit"
      />
    </div>

    <q-card v-if="startup">
      <q-card-section>
        <div><strong>Industry:</strong> {{ startup.industry || '—' }}</div>
        <div><strong>Website:</strong> {{ startup.website || '—' }}</div>
        <div><strong>Description:</strong></div>
        <div class="q-mt-xs">{{ startup.description || 'No description provided.' }}</div>
      </q-card-section>
    </q-card>

    <div v-else>Loading...</div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from 'boot/firebase'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const startup = ref(null)
const loading = ref(true)
const auth = getAuth()

onMounted(async () => {
  const snap = await getDoc(doc(db, 'startups', id))
  if (snap.exists()) startup.value = snap.data()
  loading.value = false
})

const canEdit = computed(() => {
  const user = auth.currentUser
  return user && startup.value?.owners?.includes(user.uid)
})

function goToEdit() {
  router.push(`/startup/${id}/edit`)
}
</script>
