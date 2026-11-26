<script setup lang="ts">
const { settings } = useSettings()
const reducedMotion = computed(() => (settings.value.reducedMotion === 'on' ? 'always' : settings.value.reducedMotion === 'off' ? 'never' : 'user'))
</script>

<template>
  <MotionConfig :reduced-motion="reducedMotion">
    <NuxtRouteAnnouncer />
    <VitePwaManifest />
    <NuxtPage />
    <RewardPopup />
  </MotionConfig>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.page-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(8px);
}
.page-leave-to {
  opacity: 0;
}
</style>
