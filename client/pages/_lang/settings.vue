<template>
  <nuxt-child :class="{ hidden: !init }" />
</template>


<script>
  export default {
    layout: 'settings',
    data() {
      return {
        init: false
      }
    },
    /**
     * 延时加载 防止切换不同layout时候样式加载效果
     */
    mounted() {
      setTimeout(() => {
        this.init = true;
      }, 100)
    }
  }
</script>