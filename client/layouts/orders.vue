<template>
  <v-app dark class="cybex page-orders">
    <!-- top navigator -->
    <appNav/>
    <!-- end top navigator -->
    <!-- content start -->
    <v-content>
      <v-container fluid>
        <perfect-scrollbar v-if="basicInited" :options="{swipeEasing: false}">
          <nuxt v-if="basicInited"/>
        </perfect-scrollbar>
      </v-container>
    </v-content>
    <!-- content end -->
    <!-- footer start -->
    <appFooter/>
    <!-- footer end -->
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import PerfectScrollbar from "perfect-scrollbar";
export default {
  components: {
    appNav: () => import("~/components/AppNavigation.vue"),
    appFooter: () => import("~/components/AppFooter.vue")
  },
  data() {
    return { ps: null };
  },
  computed: {
    ...mapGetters({
      basicInited: "user/inited"
    })
  },
  mounted() {
    if (!this.ps) {
      this.ps = new PerfectScrollbar("html", { useBothWheelAxes: false });
    }
  },
  beforeDestroy() {
    this.ps.destroy();
  },
  head() {
    // todo 动态获取价格
    return {
      title: this.$t("title.orders")
    };
  }
};
</script>

<style lang="stylus">
@require '~assets/style/orders';
@require '~assets/style/_vars/_colors';

.page-orders {
  .page-head-title {
    height: 96px;
    font-size: 24px;
    line-height: 1.17;
    letter-spacing: 0.3px;
    color: $main.white;
    padding: 41px 0 27px 96px;
    margin-bottom: 16px;
    f-cybex-style('heavy');
  }
  .container {
    overflow-x: auto;
    height: 100%;
    width: 100%;
    min-height: 532px;
    padding: 0;
  }

  .content-container {
    height: 100%;
    max-width: 1280px;
    margin: 0 auto;
  }
}
.cybex.theme--dark {
  .asset-tabs {
    .v-tabs__bar {
      padding: 0 96px 16px 90px;
    }
  }
} 
</style>
