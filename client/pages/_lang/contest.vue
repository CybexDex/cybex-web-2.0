<template>
  <nuxt-child />
</template>

<script>
export default {
  // 交易页面需求 @see http://confluence.nbltrust.com/pages/viewpage.action?pageId=68714497
  layout: "exchange",
  mounted() {
    window.addEventListener("resize", this.changeInnerWidth);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.changeInnerWidth);
  },
  middleware: "contest",
  methods: {
    changeInnerWidth() {
      this.$store.commit("exchange/SET_INNER_WIDTH", window ? window.innerWidth : null);
    }
  }
};
</script>
