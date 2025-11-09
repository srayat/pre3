<template>
  <div class="event-settings">
    <div class="text-h6 text-weight-bold q-mb-md">Event Settings</div>

    <q-input
      :model-value="formData.location"
      @update:model-value="(value) => updateField('location', value)"
      label="Location: City/State (optional)"
      outlined
      dense
      :disable="loading"
      class="q-mb-md"
    />

    <q-input
      :model-value="formData.capacity"
      @update:model-value="(value) => updateField('capacity', Number(value))"
      label="Capacity (optional)"
      type="number"
      outlined
      dense
      :min="1"
      :disable="loading"
      class="q-mb-md"
    />

    <q-toggle
      :model-value="formData.isPublic"
      @update:model-value="(value) => updateField('isPublic', value)"
      label="Event Code Required"
      :disable="loading"
    />

    <div class="text-caption text-grey-7 q-mt-sm">
      {{
        formData.isPublic
          ? 'Only those with the event code can join (Use this)'
          : 'Only invited participants can join (Rarely used)'
      }}
    </div>
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

const updateField = (field, value) => {
  emit('update:formData', {
    ...props.formData,
    [field]: value,
  })
}
</script>
