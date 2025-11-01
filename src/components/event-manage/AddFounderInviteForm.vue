<!-- src/components/event-manage/AddFounderInviteForm.vue -->
<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <q-input
      v-model="founderEmail"
      label="Founder Email"
      type="email"
      :rules="[val => /.+@.+\..+/.test(val) || 'Valid email required']"
      outlined
      dense
    />

    <div class="q-pt-md flex justify-end">
      <q-btn
        label="Send Invite"
        color="primary"
        type="submit"
        :loading="loading"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useFounderInvite } from 'src/composables/useFounderInvite'

const props = defineProps({
  eventId: { type: String, required: true }   // passed from parent page
})

const $q = useQuasar()
const { sendInvite } = useFounderInvite()

const founderEmail = ref('')
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    const res = await sendInvite({ founderEmail: founderEmail.value, eventId: props.eventId })
    $q.notify({ type: 'positive', message: res.message || 'Invite sent!' })
    founderEmail.value = ''
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: err.message || 'Failed to send invite' })
  } finally {
    loading.value = false
  }
}
</script>
