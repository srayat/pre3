<template>
  <transition name="fade">
    <slot />
  </transition>
</template>

<script setup>
// This is just a wrapper for transition - no logic needed
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>