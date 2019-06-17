<template>
  <nuxt-child />
</template>

<script>
export default {
  layout: "exchange",
  mounted() {
    window.addEventListener("resize", this.changeInnerWidth);
    // init k-chart suitable size
    // this.onResize();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.changeInnerWidth);
  },
  middleware: "currency",
  methods: {
    changeInnerWidth() {
      this.$store.commit("exchange/SET_INNER_WIDTH", window ? window.innerWidth : null);
    }
    // onResize() {
      // todo: 根据屏幕宽度初始不同K线图的大小
      // console.log("window.innerWidth", window.innerWidth);
    // }
  }
};
</script>