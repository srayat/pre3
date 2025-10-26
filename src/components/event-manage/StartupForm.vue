<template>
  <q-form
    ref="formRef"
    class="column q-gutter-sm q-mt-sm form-section"
    @submit.prevent="handleSubmit"
  >
    <q-input
      v-model="formData.startupName"
      label="Startup Name"
      dense
      outlined
      :disable="localLoading"
      :rules="[requiredRule]"
    />
    <q-input
      v-model="formData.startupDescription"
      label="Startup Description (optional)"
      type="textarea"
      autogrow
      outlined
      :disable="localLoading"
    />
    <q-input
      v-model="formData.email"
      label="Founder Email"
      dense
      outlined
      type="email"
      :disable="localLoading"
      :rules="[emailRule]"
    />

<div class="row q-gutter-sm">
  <q-btn
    type="button"
    color="grey"
    label="Cancel"
    no-caps
    class="q-py-sm"
    unelevated
    :disable="localLoading"
    @click="$emit('cancel')"
  />
  <q-btn
    type="submit"
    color="primary"
    :label="startupData ? 'Update Startup' : 'Save Startup'"
    no-caps
    class="q-py-sm"
    unelevated
    :loading="localLoading"
  />
</div>
  </q-form>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from 'boot/firebase'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const props = defineProps({
  loading: Boolean,
  eventId: String,
  startupData: Object  // ADD THIS PROP
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)
const localLoading = ref(false)
const formData = reactive({
  startupName: '',
  startupDescription: '',
  email: ''
})

const requiredRule = (val) => (!!val && val.trim().length > 0) || 'This field is required'
const emailRule = (val) => (!val || isValidEmail(val)) || 'Enter a valid email address'

// Pre-populate form when startupData changes
watch(() => props.startupData, (newStartupData) => {
  if (newStartupData) {
    formData.startupName = newStartupData.name || ''
    formData.startupDescription = newStartupData.description || ''
    formData.email = newStartupData.founderEmail || ''
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!formData.startupName.trim() || !isValidEmail(formData.email)) {
    return
  }

  if (!props.eventId) {
    $q.notify({
      type: 'negative',
      message: 'Cannot save startup: No event context found.',
      timeout: 3000
    })
    return
  }

  localLoading.value = true

  try {
    const startupData = {
      name: formData.startupName.trim(),
      description: formData.startupDescription.trim() || '',
      founderEmail: formData.email.trim(),
      status: 'active',
      updatedAt: serverTimestamp()
    }

    if (props.startupData) {
      // UPDATE EXISTING STARTUP
      const startupRef = doc(db, 'events', props.eventId, 'startups', props.startupData.id)
      await updateDoc(startupRef, startupData)
    } else {
      // CREATE NEW STARTUP
      const startupsRef = collection(db, 'events', props.eventId, 'startups')
      startupData.createdAt = serverTimestamp()
      await addDoc(startupsRef, startupData)
    }

    // Reset form properly (only if not in edit mode)
    if (!props.startupData) {
      formData.startupName = ''
      formData.startupDescription = ''
      formData.email = ''
      
      // Wait for next tick to ensure form updates, then clear validation
      await nextTick()
      formRef.value?.resetValidation()
    }

    $q.notify({
      type: 'positive',
      message: props.startupData ? 'Startup updated successfully!' : 'Startup added successfully!',
      timeout: 3000
    })

    // EMIT SUBMIT EVENT TO CLOSE FORM
    emit('submit')

  } catch (error) {
    console.error('Error saving startup:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to ${props.startupData ? 'update' : 'save'} startup. Please try again.`,
      timeout: 3000
    })
  } finally {
    localLoading.value = false
  }
}
</script>