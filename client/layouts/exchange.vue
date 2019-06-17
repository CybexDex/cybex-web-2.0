<template>
  <v-app
    dark
    class="cybex exchange page-contest"
    :class="{'small-size': height == 40}"
    v-resize="resizeLayout"
  >
    <!-- top navigator -->
    <appNav :height="height"/>
    <!-- end top navigator -->
    <!-- content start -->
    <v-content>
      <v-container fluid class="pa-0">
        <perfect-scrollbar v-if="inited" :options="{swipeEasing: false}">
          <transition name="layout" mode="out-in">
            <nuxt/>
          </transition>
        </perfect-scrollbar>
        <Loading v-else/>
      </v-container>
    </v-content>

    <!-- content end -->
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import PerfectScrollbar from "perfect-scrollbar";

export default {
  components: {
    appNav: () => import("~/components/AppNavigation.vue"),
    Loading: () => import("~/components/exchange/ExchangeLoading.vue")
  },
  data() {
    return {
      height: 60,
      ps: null,
      exchangeInited: false
    };
  },
  computed: {
    ...mapGetters({
      basicInited: "user/inited"
    }),
    inited() {
      return this.exchangeInited && this.basicInited;
    }
  },
  async mounted() {
    // 滚动条
    this.resizeLayout();
    if (this.basicInited && !this.exchangeInited) {
      await this.initExchange();
      this.exchangeInited = true;
    }
    if (!this.ps) {
      this.ps = new PerfectScrollbar("html");
    }
  },
  beforeDestroy() {
    this.ps.destroy();
  },
  methods: {
    ...mapActions({
      initExchange: "exchange/init"
    }),
    resizeLayout: function() {
      this.height = window.innerHeight < 749 ? 40 : 60;
      if (!this.ps) {
        this.ps = new PerfectScrollbar("html");
      } else {
        this.ps.update();
      }
    }
  },
  head() {
    return {
      title: this.$t("title.exchange-default")
    };
  },
  watch: {
    async $route(newV, oldV) {
      if (newV.params.currency !== oldV.params.currency || newV.params.pairs !== oldV.params.pairs) {
        this.exchangeInited = false;
        await this.initExchange();
        this.exchangeInited = true;
      }
    },
    async basicInited(newval, oldval) {
      if (newval && !oldval && !this.exchangeInited) {
        await this.initExchange();
        this.exchangeInited = true;
      }
    }
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_vars/_vars';
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';
@require '~assets/style/orders';

.exchange {
  .container {
    font-size: 12px;

    .v-input {
      font-size: 12px;
    }

    overflow-x: auto;
    height: 'calc(100vh - %s)' % nav-height;

    .container_layout {
      padding: 0 0 12px 12px !important;
    }
  }

  &.small-size {
    .container {
      height: 'calc(100vh - %s)' % small-nav-height;
      min-height: 647px;
    }
  }
}

.LeftSide {
  min-width: 762px;
  overflow-x: hidden;
}

.RightSide {
  flex: 0 1 532px;
  margin-left: 12px;
  padding-right: 12px;
}

.exchange-block-container {
  padding: 0 8px;
  f-cybex-style(medium);

  &.has-scroll {
    padding-right: 4px !important;
  }
}

.ExchangeSellingFormContainer {
  min-height: 290px;
}

.flex-label {
  flex: 0 1 auto !important;
  margin-right: 24px;

  > span {
    flex: 1 0 28px !important;
    border-radius: 4px;
    background-color: $main.anchor;
    padding: 7px 7px 5px;
    text-align: center;
    margin: 8px 2px 8px;
    color: $main.grey;
    cursor: pointer;
    f-cybex-style(heavy);

    &.selected, &:hover {
      color: $main.orange;

      .v-icon:before, * {
        color: $main.orange;
      }
    }

    &:first-child {
      margin-left: 0 !important;
    }

    &:last-child {
      margin-right: 0 !important;
    }
  }
}

.FlexHalf {
  flex: 1 1 50% !important;
  border-radius: 4px;
  background-color: $main.lead;
  position: relative;
  min-width: 262px;

  &-1 {
    @extend .FlexHalf;
    margin-right: 6px;
    margin-bottom: 4px;
  }

  &-2 {
    @extend .FlexHalf;
    margin-left: 6px;
    margin-bottom: 4px;
    overflow-y: auto;
  }

  &-3 {
    @extend .FlexHalf;
    margin-top: 4px;
    margin-right: 6px;
    min-height: 300px;
  }

  &-4 {
    @extend .FlexHalf;
    margin-left: 6px;
    margin-top: 4px;
    min-height: 300px;
  }
}

.exchange-book-trade-container {
  // 减去底部form
  height: calc(100% - 304px);
  padding-top: 8px;
  min-height: 263px; // 保证至少显示3行买和3行卖交易信息
}

.exchange-block-title {
  height: title-height;
  color: white;
  padding: 12px 0;
  line-height: 1.33;
  f-cybex-style('black');
  align-items: flex-end;

  &.fixed {
    position: absolute;
    background-color: $main.lead;
    z-index: 3;
  }
}

.exchange-list-head {
  height: 32px;
  color: rgba($main.white, 0.5);
  display: flex;
  line-height: 1.33;
  align-items: center;
  padding: 7px 0 9px;
}
</style>

