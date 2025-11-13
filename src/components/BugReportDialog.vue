<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="width: 90vw; max-width: 500px">
      <q-card-section>
        <div class="text-h6 text-primary">Report a Bug</div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          Help us improve by reporting issues you encounter.
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="submitBugReport" class="q-gutter-md">
          <!-- Title -->
          <q-input
            v-model="bugReport.title"
            label="Bug Title *"
            hint="Brief description of the issue"
            outlined
            :rules="[(val) => !!val || 'Title is required']"
            maxlength="100"
            counter
          />

          <!-- Category -->
          <q-select
            v-model="bugReport.category"
            :options="categories"
            label="Category *"
            outlined
            emit-value
            map-options
            :menu-props="{
              maxWidth: '450px',
              anchor: 'bottom left',
              self: 'top left',
            }"
            :rules="[(val) => !!val || 'Category is required']"
          />

          <!-- Description -->
          <q-input
            v-model="bugReport.description"
            label="Description *"
            hint="What happened? What did you expect?"
            outlined
            type="textarea"
            rows="5"
            :rules="[(val) => !!val || 'Description is required']"
            maxlength="1000"
            counter
          />

          <!-- Priority -->
          <q-select
            v-model="bugReport.priority"
            :options="priorities"
            label="Priority"
            outlined
            emit-value
            map-options
            :menu-props="{
              maxWidth: '450px',
              anchor: 'bottom left',
              self: 'top left',
            }"
          />

          <!-- Buttons -->
          <div class="row q-gutter-sm justify-end">
            <q-btn label="Cancel" color="grey-7" flat @click="closeDialog" :disable="submitting" />
            <q-btn
              label="Submit Report"
              type="submit"
              color="primary"
              unelevated
              :loading="submitting"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from 'boot/firebase'
import { useRoute } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const route = useRoute()

const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const submitting = ref(false)

const bugReport = ref({
  title: '',
  description: '',
  category: '',
  priority: 'medium',
})

const categories = [
  { label: '🐛 Functionality Issue', value: 'functionality' },
  { label: '🎨 UI/Design Issue', value: 'ui' },
  { label: '💥 App Crash', value: 'crash' },
  { label: '🐌 Performance Issue', value: 'performance' },
  { label: '❓ Other', value: 'other' },
]

const priorities = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  bugReport.value = {
    title: '',
    description: '',
    category: '',
    priority: 'medium',
  }
}

const getUserInfo = () => {
  const user = auth.currentUser
  return {
    userId: user?.uid || 'anonymous',
    userEmail: user?.email || 'not-provided',
    userName: user?.displayName || 'Anonymous User',
  }
}

const getDeviceInfo = () => {
  const ua = navigator.userAgent

  let device = 'Desktop'
  if (/iPhone/.test(ua)) device = 'iPhone'
  else if (/iPad/.test(ua)) device = 'iPad'
  else if (/Android/.test(ua)) device = 'Android'
  else if (/Mac/.test(ua)) device = 'Mac'
  else if (/Windows/.test(ua)) device = 'Windows'

  let browser = 'Unknown'
  if (/Chrome/.test(ua) && !/Edge/.test(ua)) browser = 'Chrome'
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'
  else if (/Firefox/.test(ua)) browser = 'Firefox'
  else if (/Edge/.test(ua)) browser = 'Edge'

  return { device, browser }
}

const submitBugReport = async () => {
  try {
    submitting.value = true

    const userInfo = getUserInfo()
    const deviceInfo = getDeviceInfo()

    const reportData = {
      ...bugReport.value,
      ...userInfo,
      ...deviceInfo,
      currentPage: route.fullPath,
      appVersion: '1.0.0',
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await addDoc(collection(db, 'bugReports'), reportData)

    $q.notify({
      type: 'positive',
      message: 'Bug report submitted successfully!',
      caption: 'Thank you for helping us improve.',
      timeout: 3000,
      icon: 'check_circle',
    })

    closeDialog()
  } catch (error) {
    console.error('❌ Error submitting bug report:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to submit bug report',
      caption: 'Please try again later.',
      timeout: 3000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Constrain dropdown menus */
:deep(.q-menu) {
  max-width: 450px !important;
}

:deep(.q-item) {
  max-width: 450px !important;
  white-space: normal !important;
  word-wrap: break-word !important;
}
</style>
