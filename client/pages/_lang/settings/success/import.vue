<template>
  <HintBackup />
</template>

<script>
  export default {
    layout: 'settings',
    components: {
      HintBackup: () => import("~/components/HintBackup.vue")
    },
  }
</script>