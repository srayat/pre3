<template>
  <q-form
    ref="formRef"
    class="column q-gutter-sm q-mt-sm form-section"
    @submit.prevent="handleSubmit"
  >
    <div class="row q-col-gutter-sm full-width wrap">
      <q-input
        v-model="formData.firstName"
        label="First Name"
        dense
        outlined
        class="col-12 col-sm-6"
        :disable="localLoading"
        :rules="[requiredRule]"
      />
      <q-input
        v-model="formData.lastName"
        label="Last Name"
        dense
        outlined
        class="col-12 col-sm-6"
        :disable="localLoading"
        :rules="[requiredRule]"
      />
    </div>
    <q-input
      v-model="formData.email"
      label="Email"
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
        :label="judgeData ? 'Update Judge' : 'Save Judge'"
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
  judgeData: Object  // ADD THIS PROP
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)
const localLoading = ref(false)
const formData = reactive({
  firstName: '',
  lastName: '',
  email: ''
})

const requiredRule = (val) => (!!val && val.trim().length > 0) || 'This field is required'
const emailRule = (val) => (!val || isValidEmail(val)) || 'Enter a valid email address'

// Pre-populate form when judgeData changes
watch(() => props.judgeData, (newJudgeData) => {
  if (newJudgeData) {
    formData.firstName = newJudgeData.firstName || ''
    formData.lastName = newJudgeData.lastName || ''
    formData.email = newJudgeData.email || ''
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!formData.firstName.trim() || !formData.lastName.trim() || !isValidEmail(formData.email)) {
    return
  }

  if (!props.eventId) {
    $q.notify({
      type: 'negative',
      message: 'Cannot save judge: No event context found.',
      timeout: 3000
    })
    return
  }

  localLoading.value = true

  try {
    const judgeData = {
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      email: formData.email.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      status: 'active',
      updatedAt: serverTimestamp()
    }

    if (props.judgeData) {
      // UPDATE EXISTING JUDGE
      const judgeRef = doc(db, 'events', props.eventId, 'judges', props.judgeData.id)
      await updateDoc(judgeRef, judgeData)
    } else {
      // CREATE NEW JUDGE
      const judgesRef = collection(db, 'events', props.eventId, 'judges')
      judgeData.createdAt = serverTimestamp()
      await addDoc(judgesRef, judgeData)
    }

    // Reset form properly (only if not in edit mode)
    if (!props.judgeData) {
      formData.firstName = ''
      formData.lastName = ''
      formData.email = ''
      
      // Wait for next tick to ensure form updates, then clear validation
      await nextTick()
      formRef.value?.resetValidation()
    }

    $q.notify({
      type: 'positive',
      message: props.judgeData ? 'Judge updated successfully!' : 'Judge added successfully!',
      timeout: 3000
    })

    // EMIT SUBMIT EVENT TO CLOSE FORM
    emit('submit')

  } catch (error) {
    console.error('Error saving judge:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to ${props.judgeData ? 'update' : 'save'} judge. Please try again.`,
      timeout: 3000
    })
  } finally {
    localLoading.value = false
  }
}
</script>