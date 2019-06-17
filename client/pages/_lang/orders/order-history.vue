<template>
  <div class="content-container">
    <div class="page-head-title mb-0">{{ $t("exchange.order-table.tab-title.history-order") }}</div>
    <v-tabs class="asset-tabs" v-model="active" slider-color="cybex" dark>
      <v-tab v-for="(tabItem, idx) in tabItems" :key="idx">{{ tabItem.title }}</v-tab>
      <v-tab-item v-for="(tabItem, idx) in tabItems" :key="idx">
        <div class="orders-area full-mode order-list">
          <ExchangeOrderHistory :white-flag="tabItem.whiteFlag" :mode="'full'"/>
        </div>
      </v-tab-item>
    </v-tabs>
  </div>
</template>
<script>
export default {
  components: {
    ExchangeOrderHistory: () =>
      import("~/components/exchange/ExchangeHistoryOrder.vue")
  },
  layout: "orders",
  data() {
    return {
      tabItems: [
        { title: this.$t("tab_label.main"), whiteFlag: "white" },
        { title: this.$t("tab_label.others"), whiteFlag: "custom" },
        { title: this.$t("tab_label.game"), whiteFlag: "game" }
      ]
    };
  },
  computed: {
    active: {
      set(val) {
        if (val === 1) {
          this.$router.push({ hash: "tab-custom" });
        } else if (val === 2) {
          this.$router.push({ hash: "tab-game" });
        } else {
          this.$router.push({ hash: null });
        }
      },
      get() {
        const hash = this.$route.hash;
        if (!hash) return 0;
        return hash === "#tab-custom" ? 1 : 2;
      }
    }
  },
  head() {
    return {
      title: this.$t("exchange.order-table.tab-title.history-order")
    };
  }
};
</script>