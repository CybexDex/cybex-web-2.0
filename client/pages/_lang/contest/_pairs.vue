<template>
  <v-layout class="container_layout" fill-height>
    <!-- 大赛申明通知 -->
    <v-dialog v-model="showNoticeDialog" persistent content-class="notice-dialog" width="464" scrollable>
      <v-icon class="btn-close" @click="closeNoticeDialog">ic-close</v-icon>
      <div class="content">
        <div class="rules-title mb-2">
          {{ $t(`info.contest_notice.line_1`) }}
        </div>
        <div
          v-for="i of [2, 3, 4, 5, 6]"
          :key="i"
          class="rules-content"
        >{{ $t(`info.contest_notice.line_${i}`) }}</div>
      </div>
      <cybex-checkbox
        small
        class="show-check mt-4 align-self-end"
        v-model="neverShowNotice"
        :label="$t('checkbox_label.never_show_again')"
      />
    </v-dialog>
    <!-- left side -->
    <v-flex class="LeftSide" column>
      <!-- 实时动态开始 -->
      <no-ssr>
        <Activity :mode="mode" :activity-data="activityData"/>
        <!-- 实时动态结束 -->
        <!-- k线图开始 -->
        <Chart/>
      </no-ssr>
      <!-- k线图结束 -->
      <!-- 交易委托历史开始 -->
      <no-ssr>
        <v-flex class="orders-area">
          <v-tabs v-model="currentTab" slider-color="cybex" dark>
            <v-tab :ripple="false">
              {{ $t('exchange.order-table.tab-title.open-order') }}
              <!-- 数字与汉字无法行内对齐 添加特殊样式 -->
              <span class="ml-1" :class="{'zh-fixed-num': locale == 'zh'}">({{ openOrderRowLen }})</span>
            </v-tab>
            <v-tab :ripple="false">{{ $t('exchange.order-table.tab-title.history-order') }}</v-tab>
            <v-tab :ripple="false">{{ $t('exchange.order-table.tab-title.history-trade') }}</v-tab>
            <v-tab-item>
              <ExchangeOpenOrder
                :white-flag="mode"
                :enable-interval="currentTab != 1"
                :order-filter="orderFilter"
                @update-row-length="v => openOrderRowLen = v"
              />
            </v-tab-item>
            <v-tab-item>
              <ExchangeOrderHistory
                :white-flag="mode"
                :enable-interval="currentTab == 1"
                :order-filter="orderFilter"
              />
            </v-tab-item>
            <v-tab-item>
              <ExchangeTradeHistory :white-flag="mode" :order-filter="orderFilter"/>
            </v-tab-item>
          </v-tabs>
          <span class="hide_pair">
            <!-- 预加载ic-check_box_active防止出现卡顿-->
            <!-- <v-icon class="hidden" style="display:none" v-html="'ic-check_box_active'" /> -->
            <cybex-checkbox :ripple="false" small v-model="hideOtherPair" :label="hideLabel"/>
          </span>
        </v-flex>
      </no-ssr>
      <!-- 交易委托历史结束 -->
    </v-flex>
    <!-- left side end-->
    <!-- right side start-->
    <v-flex class="RightSide">
      <v-flex class="exchange-book-trade-container" d-flex>
        <no-ssr>
          <!-- 交易实时价格开始 -->
          <OrderBook @set-form-price="setFormPrice"/>
          <!-- 交易实时价格结束 -->
          <!-- 交易记录列表开始-->
          <MarketTrades :trades="trades" @set-form-price="setFormPrice"/>
          <!-- 交易记录列表结束-->
        </no-ssr>
      </v-flex>

      <!-- 交易表单开始 -->
      <v-flex class="ExchangeSellingFormContainer" d-flex>
        <v-flex class="FlexHalf-3">
          <no-ssr>
            <ExchangeForm
              is-buy
              :balance-digits="balanceDigits"
              :form-data.sync="formData"
              @create-trade-success="createTradeSuccess"
            />
          </no-ssr>
        </v-flex>
        <v-flex class="FlexHalf-4">
          <no-ssr>
            <ExchangeForm
              :balance-digits="balanceDigits"
              :form-data.sync="formData"
              @create-trade-success="createTradeSuccess"
            />
          </no-ssr>
        </v-flex>
      </v-flex>
      <!-- 交易表单结束 -->
    </v-flex>
    <!-- right side end-->
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import utils from "~/components/mixins/utils";
import { concat, uniqBy, keys } from "lodash";
import config from "~/lib/config/config.js";
import { BigNumber } from "bignumber.js";

export default {
  components: {
    Activity: () => import("~/components/exchange/ExchangeActivity.vue"),
    Chart: () => import("~/components/exchange/ExchangeChart.vue"),
    OrderBook: () => import("~/components/exchange/ExchangeOrderBook.vue"),
    MarketTrades: () =>
      import("~/components/exchange/ExchangeMarketTrades.vue"),
    ExchangeForm: () => import("~/components/exchange/ExchangeForm.vue"),
    ExchangeOpenOrder: () =>
      import("~/components/exchange/ExchangeHistoryOpenOrder.vue"),
    ExchangeOrderHistory: () =>
      import("~/components/exchange/ExchangeHistoryOrder.vue"),
    ExchangeTradeHistory: () =>
      import("~/components/exchange/ExchangeHistoryTrade.vue"),
    VersionDialog: () => import("~/components/VersionDialog.vue")
  },
  data() {
    return {
      mode: "game",
      openOrderRowLen: 0,
      hideLabel: this.$t("exchange.order-table.filter.hide"),
      // 刷新定时器
      intervalActivity: null,
      intervalLowHigh: null,
      currentTab: 0,
      hideOtherPair: false,
      trades: [],
      activityData: {},
      balanceDigits: {},
      historyData: {
        open: {
          rowsData: [],
          isLoading: this.currentUser !== null
        },
        history: {
          rowsData: [],
          page: 0,
          limit: 20,
          isLoading: this.currentUser !== null
        },
        trade: {
          rowsData: [],
          page: 0,
          limit: 20,
          isLoading: this.currentUser !== null
        }
      },
      formData: {
        buyPrice: null,
        sellPrice: null,
        buyTotal: null,
        sellTtaol: null
      },
      formBuyPrice: null,
      formBuyTotal: null,
      formSellPrice: null,
      formSellTotal: null,
      legalFormBuyPrice: null,
      legalFormSellPrice: null,
      createTrade: false,
      neverShowNotice: false,
      showNoticeDialog: null,
    };
  },
  computed: {
    ...mapGetters({
      navMenus: "navMenus",
      locale: "i18n/locale",
      isConnect: "exchange/connect",
      coinMap: "user/coins",
      coinMapInvert: "user/coinsInvert",
      currentUser: "auth/username",
      baseCurrency: "exchange/base",
      asset_is_custom: "exchange/asset_is_custom",
      base_id: "exchange/base_id",
      quoteCurrency: "exchange/quote",
      quote_id: "exchange/quote_id",
      tradesRefreshRate: "exchange/tradesRefreshRate",
      noticeFlag: "user/noticeFlag",
      pairs: "user/pairs"
    }),
    filterPair: function() {
      return this.hideOtherPair
        ? { base_id: this.base_id, quote_id: this.quote_id }
        : { base_id: null, quote_id: null };
    },
    orderFilter: function() {
      let pair = this.hideOtherPair
        ? { base_id: this.base_id, quote_id: this.quote_id }
        : { base_id: null, quote_id: null };
      return Object.assign({}, pair, { refresh: this.createTrade });
    },
    digitsPrice: function() {
      const defaultDigits = this.asset_is_custom ? 8 : 2;
      return new BigNumber(
        this.getPairConfig(
          this.baseCurrency,
          this.quoteCurrency,
          "book",
          "last_price",
          defaultDigits
        )
      ).toNumber();
    }
  },
  watch: {
    isConnect: function(newVal, oldVal) {
      console.log("isconnect status changed", newVal);
    },
    currentUser: function(newVal) {
      this.loadNoticeFlag(this.currentUser).then(res => {
        console.log('hello', res);
      });
    }
  },
  async mounted() {
    if (this.$route.params.pairs && this.navMenus) {
      // 交易大赛是否允许开启
      let isGameActive = this.navMenus ? this.navMenus.internal.contest.enable : false;
      if (!isGameActive) {
        this.$nuxt.error({ statusCode: 404, message: "" });
      }
    }
    await this.fetchData();
    this.loadNoticeFlag(this.currentUser).then(res => {
      this.showNoticeDialog = !this.noticeFlag;
    });
  },
  beforeDestroy() {
    // 确保定时器清除
    clearInterval(this.intervalActivity);
    clearInterval(this.intervalLowHigh);
  },
  mixins: [utils],
  methods: {
    ...mapActions({
      loadNoticeFlag: "user/loadNoticeFlag",
    }),
    closeNoticeDialog() {
      this.showNoticeDialog = false;
      this.$store.commit("user/SET_NOTICE_FLAG", {
        username: this.currentUser,
        flag: this.neverShowNotice,
        save: true
      });
    },
    // 资产精度
    async getBalanceDigits(base, quote) {
      let baseInfo = await this.cybexjs.queryAsset(base);
      let quoteInfo = await this.cybexjs.queryAsset(quote);
      // console.log('baseInfo', baseInfo)
      // console.log('quoteInfo', quoteInfo)
      return {
        base: baseInfo.precision,
        quote: quoteInfo.precision
      };
    },
    async createTradeSuccess() {
      //重新刷新 open Order
      console.log("refresh open order");
      this.createTrade = !this.createTrade;
    },
    async fetchData() {
      if (
        !this.isConnect ||
        !this.coinMapInvert ||
        !this.base_id ||
        !this.quote_id
      )
        return;
      // 监听网络状态

      this.currentTab = 0;
      this.formData = {
        buyPrice: null,
        sellPrice: null,
        buyTotal: null,
        sellAmount: null
      };
      this.intervalActivity = null;
      this.intervalLowHigh = null;
      // base_id
      console.log(
        `>>> 初始化交易数据 base_id ${this.base_id} quote_id ${this.quote_id}`
      );
      // 资产精度
      this.$eventHandle(this.getBalanceDigits, [this.base_id, this.quote_id])
        .then(res => {
          this.balanceDigits = res;
          console.log(">>> 初始化资产精度", new Date(), res);
        })
        .catch(e => {
          this.balanceDigits = {
            base: 5,
            quote: 5
          };
        });

      // 获取24小时交易信息
      this.$eventHandle(this.loadActivity, [this.base_id, this.quote_id])
        .then(console.log(">>> 初始化24小时交易信息"))
        .catch(e => {});
    },
    async loadActivity(base, quote) {
      let func = async () => {
        // 24小时数据
        let actData = await this.cybexjs.ticker(base, quote);
        this.activityData = Object.assign({}, this.activityData, actData);
      };
      // low high 刷新频率1分钟
      let lowHigh = async () => {
        // 24小时最高最低成交价
        const lowHigh = await this.cybexjs.lowhigh(base, quote);
        this.activityData["high"] = lowHigh[0];
        this.activityData["low"] = lowHigh[1];
      };
      await func();
      await lowHigh();
      // form price只需要初始化第一次 其余由用户自己交互
      let price = this.activityData.latest;
      let newData = {
        buyPrice: parseFloat(price).toFixed(this.digitsPrice),
        sellPrice: parseFloat(price).toFixed(this.digitsPrice)
      };
      this.formData = Object.assign({}, this.formData, newData);
      // console.log(">>>>>> Activity 24小时动态数据", this.activityData);
      if (!this.intervalActivity) {
        this.intervalActivity = setInterval(async function() {
          await func();
        }, this.tradesRefreshRate);
      }
      if (!this.intervalLowHigh) {
        this.intervalLowHigh = setInterval(async function() {
          await lowHigh();
        }, 60000);
      }
    },
    /**
     * info { price: number, total: null | number, side: 'buy'| 'sell'}
     */
    async setFormPrice(info) {
      console.log("user clicked price in order book or market trades", info);
      let newData = {
        buyPrice: parseFloat(info.price).toFixed(this.digitsPrice),
        sellPrice: parseFloat(info.price).toFixed(this.digitsPrice),
        buyTotal: null,
        sellAmount: null
      };
      // 用户点击Orderbook中的卖单 设置买单Total,  通过price计算amount 向下取值
      // 反之点击Orderbook中的买单 设置卖单Amount, 通过price计算Total 向上取值
      if (info.side == "sell") {
        newData["buyTotal"] = parseFloat(info.total);
        // 清空sell
        newData["sellAmount"] = "clean";
      } else if (info.side == "buy") {
        newData["sellAmount"] = parseFloat(info.amount);
        newData["buyTotal"] = "clean";
      }
      this.formData = Object.assign({}, this.formData, newData);
    }
  }
};
</script>
<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.notice-dialog {
  background: $main.lead;
  font-size: 12px;
  line-height: 1.83;
  color: rgba($main.white, 0.8);
  flex-direction: column;
  max-height: 510px !important;

  .rules-title {
    f-cybex-style('heavy');
  }
  .rules-content {
    margin-bottom: 5px;
  }
}
</style>
