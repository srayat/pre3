<template>
  <q-form @submit.prevent="handleAddStartup" class="q-gutter-md">
    <q-input
      v-model="name"
      label="Startup Name *"
      outlined
      :rules="[
        val => !!val && val.trim().length > 0 || 'Name is required',
        val => val.trim().length <= 100 || 'Name must be 100 characters or less'
      ]"
      :disable="loading"
      counter
      maxlength="100"
    />
    
    <q-input 
      v-model="description" 
      label="Description" 
      type="textarea" 
      outlined
      autogrow
      :disable="loading"
      counter
      maxlength="500"
      hint="Optional: Brief description of the startup"
    />
    
    <q-input 
      v-model="industry" 
      label="Industry" 
      outlined
      :disable="loading"
      hint="e.g., FinTech, HealthTech, AI"
    />
    
    <q-input 
      v-model="website" 
      label="Website (optional)" 
      outlined
      type="url"
      :rules="[
        val => !val || isValidUrl(val) || 'Please enter a valid URL (e.g., https://example.com)'
      ]"
      :disable="loading"
      placeholder="https://example.com"
    />

    <div class="row justify-between items-center">
      <q-btn
        v-if="name || description || industry || website"
        flat
        label="Clear"
        color="grey"
        @click="resetForm"
        :disable="loading"
      />
      <q-btn
        type="submit"
        label="Add Startup"
        color="primary"
        icon="add"
        :loading="loading"
        :disable="!name || !name.trim()"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useStartups } from 'src/composables/useStartups'

const props = defineProps({
  eventId: { type: String, required: true }
})

const emit = defineEmits(['startup-added'])

const { addStartup, loading } = useStartups()
const $q = useQuasar()

const name = ref('')
const description = ref('')
const industry = ref('')
const website = ref('')

function isValidUrl(url) {
  if (!url || url.trim().length === 0) return true // Optional field
  try {
    const urlObj = new URL(url.trim())
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

function resetForm() {
  name.value = ''
  description.value = ''
  industry.value = ''
  website.value = ''
}

async function handleAddStartup() {
  try {
    const res = await addStartup({
      eventId: props.eventId,
      name: name.value,
      description: description.value,
      industry: industry.value,
      website: website.value
    })

    $q.notify({ 
      type: 'positive', 
      message: res.message || 'Startup added successfully!',
      icon: 'check_circle'
    })

    emit('startup-added', res.startupId)
    resetForm()

  } catch (err) {
    console.error('❌ Error adding startup:', err)
    
    // Show user-friendly error messages
    let errorMessage = 'Failed to add startup.'
    
    if (err.code === 'functions/already-exists') {
      errorMessage = 'A startup with this name already exists in this event.'
    } else if (err.code === 'functions/permission-denied') {
      errorMessage = 'You do not have permission to add startups to this event.'
    } else if (err.message) {
      errorMessage = err.message
    }

    $q.notify({ 
      type: 'negative', 
      message: errorMessage,
      icon: 'error',
      timeout: 5000
    })
  }
}
</script>

<style scoped>
.q-form {
  max-width: 600px;
}
</style>