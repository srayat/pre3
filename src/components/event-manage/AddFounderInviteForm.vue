<!--
  ──────────────────────────────────────────────────────────────────────────────
  Component: AddFounderInviteForm.vue
  Location:  src/components/event-manage/AddFounderInviteForm.vue
  ──────────────────────────────────────────────────────────────────────────────
  PURPOSE
  • Provides a simple form for an event host to send an invitation email
    to a startup founder using their email address.
  • This version assumes the host already has an eventId (passed as a prop)
    and wants to trigger a Cloud Function or Firestore write through
    the useFounderInvite() composable.

  USAGE CONTEXT
  • Originally used in the event management flow where hosts could add
    founders by email (pre-Version-1 simplification).
  • Can be re-enabled later in Version 2 of the product when the
    “Founder Claim Flow” is reintroduced.
  • Typical usage:
      <AddFounderInviteForm :event-id="selectedEventId" />

  DEPENDENCIES
  • Quasar Framework components:
      - QForm, QInput, QBtn, QNotify
  • Composable: useFounderInvite()
      - Provides sendInvite({ founderEmail, eventId })
      - Handles Firestore/Cloud Function call and response messages

  PROPS
  • eventId  (String, required)
      - The Firestore document ID of the event under which the invite
        will be recorded or sent.

  DATA / STATE
  • founderEmail (String)
      - Two-way bound to input field.
  • loading (Boolean)
      - Disables button and shows spinner while awaiting response.

  FLOW
  1. Host enters a valid founder email address.
  2. Form validation ensures proper email format.
  3. On submit, handleSubmit() calls sendInvite().
  4. If successful → Quasar positive notification and form reset.
     If failed → negative notification with error message.
  5. Emits no events; relies on composable side effects (e.g., Firestore).

  FUTURE REUSE
  • Can be easily adapted for “Send Startup Claim Link” functionality
    in Version 2a/2b by adding:
      - Additional startupId parameter
      - Status indicators (“Pending”, “Claimed”)
      - Integration with invite tracking subcollection

  LAST UPDATED: 2025-11-02
  AUTHOR: [Your Name]
  ──────────────────────────────────────────────────────────────────────────────
-->

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
