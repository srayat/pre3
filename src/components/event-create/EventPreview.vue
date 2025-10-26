<template>
  <div class="event-preview">
    <div class="text-h6 text-weight-bold q-mb-md">Event Preview</div>
    
    <q-card flat bordered class="q-pa-md">
      <div class="text-h6 text-primary">{{ formData.name || 'Untitled Event' }}</div>
      
      <div class="text-body2 q-mt-sm q-mb-md">
        {{ formData.description || 'No description provided' }}
      </div>
      
      <div class="row items-center q-gutter-md text-caption text-grey-7">
        <div v-if="formData.date" class="row items-center">
          <q-icon name="event" size="16px" class="q-mr-xs" />
          {{ formatDate(formData.date) }}
        </div>
        
        <div v-if="formData.location" class="row items-center">
          <q-icon name="location_on" size="16px" class="q-mr-xs" />
          {{ formData.location }}
        </div>
        
        <div v-if="formData.capacity" class="row items-center">
          <q-icon name="people" size="16px" class="q-mr-xs" />
          {{ formData.capacity }} participants
        </div>
      </div>
      
      <q-badge 
        :color="formData.isPublic ? 'positive' : 'orange'" 
        class="q-mt-md"
      >
        {{ formData.isPublic ? 'Public' : 'Private' }}
      </q-badge>
    </q-card>
    
    <div class="text-caption text-grey-6 q-mt-md">
      After creation, you'll receive a unique 5-digit code to share with participants.
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventPreview',
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  setup() {
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString + 'T00:00:00')
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    return {
      formatDate
    }
  }
}
</script>