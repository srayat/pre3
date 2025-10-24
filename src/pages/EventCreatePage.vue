<template>
  <q-page class="event-create-page column q-pa-lg q-gutter-lg">
    <div class="row items-center">
      <q-btn flat round icon="arrow_back" color="primary" @click="goBack" />
      <div class="text-h5 text-weight-bold text-primary q-ml-sm">Create an Event</div>
    </div>

    <div class="text-body1 text-grey-7">
      Share a few details to spin up your pitch event. You can invite founders and judges after
      saving.
    </div>

    <q-form class="column q-gutter-md" @submit.prevent="handleSubmit">
      <q-input
        v-model="form.name"
        label="Event Name"
        outlined
        dense
        :rules="[requiredRule]"
        :disable="loading"
      />

      <q-input
        v-model="form.description"
        label="Event Description"
        type="textarea"
        outlined
        autogrow
        :disable="loading"
      />

      <q-input
        v-model="form.date"
        label="Event Date"
        mask="####-##-##"
        hint="Use YYYY-MM-DD format"
        outlined
        dense
        :rules="[dateRule]"
        :disable="loading"
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy>
              <q-date v-model="form.date" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        v-model="form.location"
        label="Location (optional)"
        outlined
        dense
        :disable="loading"
      />

      <q-input
        v-model.number="form.capacity"
        label="Capacity (optional)"
        type="number"
        outlined
        dense
        :min="1"
        :disable="loading"
      />

      <q-btn
        type="submit"
        color="primary"
        no-caps
        unelevated
        class="q-py-sm"
        :loading="loading"
        label="Save Event"
      />
    </q-form>

    <q-separator />

    <div class="text-caption text-grey-6">
      After creating an event, you will be able to invite startup founders and judges using their
      email addresses.
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { serverTimestamp, addDoc, collection } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'

const router = useRouter()
const $q = useQuasar()
const loading = ref(false)

const form = reactive({
  name: '',
  description: '',
  date: '',
  location: '',
  capacity: null,
})

const requiredRule = (val) => !!val && val.trim().length > 0 || 'This field is required'

const dateRule = (val) =>
  !val ||
  /^\d{4}-\d{2}-\d{2}$/.test(val) ||
  'Enter a valid date in YYYY-MM-DD format'

function goBack() {
  router.back()
}

async function handleSubmit() {
  if (!auth.currentUser) {
    $q.notify({ type: 'negative', message: 'You must be signed in to create an event.' })
    await router.replace('/sign-in')
    return
  }

  if (!form.name.trim()) {
    $q.notify({ type: 'warning', message: 'Event name is required.' })
    return
  }

  try {
    loading.value = true
    const timestamp = serverTimestamp()

    const eventRef = await addDoc(collection(db, 'events'), {
      name: form.name.trim(),
      description: form.description.trim(),
      date: form.date || null,
      location: form.location.trim() || null,
      capacity: form.capacity || null,
      hostUid: auth.currentUser.uid,
      status: 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    $q.notify({ type: 'positive', message: 'Event created successfully.' })
    await router.replace({ path: `/events/${eventRef.id}`, query: { created: '1' } })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'We could not save your event. Please try again.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.event-create-page {
  min-height: 100%;
  background: linear-gradient(180deg, #edf2fb 0%, #ffffff 90%);
}
</style>
