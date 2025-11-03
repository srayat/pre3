<template>
  <div class="event-basic-info">
    <div class="text-h6 text-weight-bold q-mb-md">Event Information</div>
    <q-input
      :model-value="formData.name"
      @update:model-value="(value) => updateField('name', value)"
      label="Event Name"
      outlined
      dense
      :rules="[requiredRule]"
      :disable="loading"
      class="q-mb-md"
    />

    <q-input
      :model-value="formData.description"
      @update:model-value="(value) => updateField('description', value)"
      label="Event Description"
      type="textarea"
      outlined
      autogrow
      :disable="loading"
      class="q-mb-md"
    />

    <q-input
      :model-value="formData.date"
      @update:model-value="(value) => updateField('date', value)"
      label="Event Date *"
      mask="####-##-##"
      hint="Use YYYY-MM-DD format"
      outlined
      dense
      :rules="[requiredRule, dateRule, futureDateRule]"
      :disable="loading"
      class="q-mb-md"
    >
      <template #append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy>
            <q-date
              :model-value="formData.date"
              @update:model-value="(value) => updateField('date', value)"
              mask="YYYY-MM-DD"
              :options="futureDatesOnly"
            />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup>
const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:formData'])

const requiredRule = (val) => (!!val && val.trim().length > 0) || 'This field is required'

const dateRule = (val) =>
  !val || /^\d{4}-\d{2}-\d{2}$/.test(val) || 'Enter a valid date in YYYY-MM-DD format'

const futureDateRule = (val) => {
  if (!val) return true // Allow empty

  const selectedDate = new Date(val)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day

  return selectedDate >= today || 'Event date cannot be in the past'
}

// Function to disable past dates in the calendar picker
const futureDatesOnly = (date) => {
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return selectedDate >= today
}

const updateField = (field, value) => {
  emit('update:formData', {
    ...props.formData,
    [field]: value,
  })
}
</script>
