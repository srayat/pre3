<template>
  <div class="startup-list-section">
    <q-card class="q-pa-md no-shadow">
      <!-- Error State -->
      <q-banner v-if="error" class="bg-negative text-white q-mb-md" rounded>
        <template #avatar>
          <q-icon name="error" />
        </template>
        {{ error }}
        <template #action>
          <q-btn flat label="Retry" @click="retrySubscription" />
        </template>
      </q-banner>

      <!-- Add Form -->
      <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div v-if="showForm" class="q-mb-md">
          <q-card flat bordered class="q-pa-md bg-grey-1">
            <add-startup-form :event-id="eventId" @startup-added="handleStartupAdded" />
          </q-card>
          <q-separator spaced />
        </div>
      </transition>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-py-lg">
        <q-spinner color="primary" size="3em" />
        <div class="text-grey-7 q-mt-md">Loading startups...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && startups.length === 0 && !error" class="text-center q-py-xl">
        <q-icon name="corporate_fare" size="4em" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">No startups yet</div>
        <div class="text-body2 text-grey-6 q-mb-md">Add your first startup to get started</div>
        <q-btn
          color="primary"
          label="Add First Startup"
          icon="add"
          @click="showForm = true"
          unelevated
        />
      </div>

      <!-- Startup List -->
      <div v-else-if="!loading">
        <div class="text-caption text-grey-7 q-mb-sm">
          {{ startups.length }} startup{{ startups.length !== 1 ? 's' : '' }}
        </div>
        <startup-list
          :startups="startups"
          @edit-startup="handleEditStartup"
          @delete-startup="handleDeleteStartup"
        />
      </div>
      <div class="">
        Event Code: {{ eventId }} To be shared with the event attendees ONLY AFTER the event goes
        live on the app.
      </div>
      <div class="row justify-center items-center q-mt-lg">
        <q-btn
          color="primary"
          :label="showForm ? 'Cancel' : 'Add Startup'"
          :icon="showForm ? 'close' : 'add'"
          @click="showForm = !showForm"
        />
      </div>
    </q-card>

    <!-- Edit Dialog -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 400px; max-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Edit Startup</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleEditSubmit" class="q-gutter-md">
            <q-input
              v-model="editForm.name"
              label="Startup Name *"
              outlined
              :rules="[
                (val) => (!!val && val.trim().length > 0) || 'Name is required',
                (val) => val.trim().length <= 100 || 'Name must be 100 characters or less',
              ]"
              counter
              maxlength="100"
            />

            <q-input
              v-model="editForm.description"
              label="Description"
              type="textarea"
              outlined
              autogrow
              counter
              maxlength="500"
            />

            <q-input v-model="editForm.industry" label="Industry" outlined />

            <q-input
              v-model="editForm.website"
              label="Website (optional)"
              outlined
              type="url"
              placeholder="https://example.com"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn flat label="Cancel" color="grey" v-close-popup />
              <q-btn
                type="submit"
                label="Save Changes"
                color="primary"
                icon="save"
                :loading="updateLoading"
                :disable="!editForm.name || !editForm.name.trim()"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useStartups } from 'src/composables/useStartups'
import AddStartupForm from '../AddStartupForm.vue'
import StartupList from './StartupList.vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  eventId: { type: String, required: true },
})

const $q = useQuasar()
const { subscribeToStartups, updateStartup, deleteStartup } = useStartups()

const startups = ref([])
const showForm = ref(false)
const loading = ref(true)
const error = ref(null)

// Edit state
const showEditDialog = ref(false)
const updateLoading = ref(false)
const editForm = reactive({
  name: '',
  description: '',
  industry: '',
  website: '',
})
let editingStartupId = null

let unsubscribe = null

function setupSubscription() {
  loading.value = true
  error.value = null

  try {
    unsubscribe = subscribeToStartups(props.eventId, startups)

    // Set loading to false after a short delay to allow first snapshot
    setTimeout(() => {
      loading.value = false
    }, 500)
  } catch (err) {
    console.error('❌ Failed to setup startup subscription:', err)
    error.value = err.message || 'Failed to load startups'
    loading.value = false
  }
}

function retrySubscription() {
  if (unsubscribe) unsubscribe()
  setupSubscription()
}

onMounted(() => {
  setupSubscription()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
})

function handleStartupAdded(startupId) {
  console.log('✅ Startup added:', startupId)
  showForm.value = false
}

function handleEditStartup(startup) {
  console.log('✏️ Edit startup:', startup.id)

  // Populate edit form
  editingStartupId = startup.id
  editForm.name = startup.name || ''
  editForm.description = startup.description || ''
  editForm.industry = startup.industry || ''
  editForm.website = startup.website || ''

  showEditDialog.value = true
}

async function handleEditSubmit() {
  updateLoading.value = true

  try {
    await updateStartup({
      eventId: props.eventId,
      startupId: editingStartupId,
      name: editForm.name,
      description: editForm.description,
      industry: editForm.industry,
      website: editForm.website,
    })

    $q.notify({
      type: 'positive',
      message: 'Startup updated successfully!',
      icon: 'check_circle',
    })

    showEditDialog.value = false

    // Reset form
    editingStartupId = null
    editForm.name = ''
    editForm.description = ''
    editForm.industry = ''
    editForm.website = ''
  } catch (err) {
    console.error('❌ Update error:', err)

    let errorMessage = 'Failed to update startup.'

    if (err.code === 'functions/already-exists') {
      errorMessage = 'A startup with this name already exists in this event.'
    } else if (err.code === 'functions/permission-denied') {
      errorMessage = 'You do not have permission to edit this startup.'
    } else if (err.message) {
      errorMessage = err.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      icon: 'error',
      timeout: 5000,
    })
  } finally {
    updateLoading.value = false
  }
}

async function handleDeleteStartup(startup) {
  console.log('🗑️ Delete startup:', startup.id)

  $q.dialog({
    title: 'Delete Startup',
    message: `Are you sure you want to delete "${startup.name}"? This action cannot be undone.`,
    cancel: {
      label: 'Cancel',
      flat: true,
      color: 'grey',
    },
    ok: {
      label: 'Delete',
      color: 'negative',
      icon: 'delete',
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteStartup({
        eventId: props.eventId,
        startupId: startup.id,
      })

      $q.notify({
        type: 'positive',
        message: `Startup "${startup.name}" deleted successfully.`,
        icon: 'check_circle',
      })
    } catch (err) {
      console.error('❌ Delete error:', err)

      let errorMessage = 'Failed to delete startup.'

      if (err.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to delete this startup.'
      } else if (err.message) {
        errorMessage = err.message
      }

      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        timeout: 5000,
      })
    }
  })
}
</script>

<style scoped>
.startup-list-section {
  max-width: 500px;
  margin: 0 auto;
}
</style>
