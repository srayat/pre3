<template>
  <EventCodeInput />
</template>

<script>
import { defineComponent } from 'vue'
import EventCodeInput from 'src/components/EventCodeInput.vue'

export default defineComponent({
  name: 'EventCodePage',
  components: {
    EventCodeInput
  }
})
</script>