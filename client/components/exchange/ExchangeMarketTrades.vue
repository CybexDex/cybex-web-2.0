
<template>
  <v-flex class="exchange-block-container has-scroll FlexHalf-2">
    <div class="exchange-block-title">
      <span>{{ $t('exchange.block-title.market-trades') }}</span>
    </div>
    <Loading v-if="isLoading"/>
    <template v-else class="exchange-block-containerWrapper">
      <div class="trade-row-container" ref="rowsContent">
        <perfect-scrollbar :options="{useBothWheelAxes: true}">
          <div v-for="(trade, idx) in trades" :key="idx" class="trade-row">
            <span
              class="price"
              @click="$emit('set-form-price', {price: parseFloat(trade.price).toFixed(digitsPrice)})"
              :class="{
                'c-buy': trade.tradetype == 'buy', 
                'c-sell': trade.tradetype =='sell'}"
            >{{ trade.price | roundDigits(digitsPrice) | shortenPrice }}</span>
            <span class="amount">{{ trade.quote | roundDigits(digitsAmount) | avoidMinAmount(digitsAmount) }}</span>
            <span class="time c-white-30">{{ trade.time | date('HH:mm:ss') }}</span>
          </div>
        </perfect-scrollbar>
      </div>
    </template>
  </v-flex>
</template>

<script>
import utils from "~/components/mixins/utils";
import { mapGetters } from "vuex";

export default {
  watch: {
    trades: function(newVal, oldVal) {
      // base_id
      this.isLoading = false;
    }
  },
  components: {
    Loading: () => import("~/components/exchange/ExchangeLoading.vue")
  },
  head() {
    let currencies = (this.$route.params.currency || this.$route.params.pairs || "").replace(/_/, "/");
    // todo 动态获取价格
    let price = this.currentOrderPrice;
    const digits = this.digitsPrice;
    price = price ? parseFloat(price).toFixed(digits) : 0;
    if (this.asset_is_custom) {
      price = this.$options.filters.shortenPrice(price);
    }
    return {
      title: this.$t("title.exchange", {
        price: price ? price : '--',
        currencies: currencies
      })
    };
  },
  data() {
    return {
      intervalMarketTrade: null,
      trades: [],
      containerWidth: "",
      isLoading: true,
      currentOrderPrice: null
      // currentOrderLegalPrice: null
    };
  },
  mixins: [utils],
  async mounted() {
    await this.initData();
    document.addEventListener("visibilitychange", this.bindIntervalEvent);
  },
  beforeDestroy() {
    this.removeInterval();
    document.removeEventListener("visibilitychange", this.bindIntervalEvent);
  },
  methods: {
    async bindIntervalEvent() {
      if (document.visibilityState == "hidden") {
        this.removeInterval();
      } else if (document.visibilityState == "visible") {
        await this.initData();
      }
    },
    async initData() {
        // 动态获取最新交易信息
      this.$eventHandle(this.fetchMarketTrades, [
        this.base_id,
        this.quote_id
      ]).then(() => {
        this.isLoading = false;
        console.log(">>> 初始化Market trades", new Date());
      }).catch(e => {});
    },
    removeInterval(){
      if (this.intervalMarketTrade) {
        // 确保定时器清除
        clearInterval(this.intervalMarketTrade);
        this.intervalMarketTrade = null;
      }
    },
    // 换算法币价格
    // async getCurrentOrderLegalPrice() {
    //   // 换算法币价格
    //   if (!this.base_id || !this.currentOrderPrice) return;
    //   this.currentOrderLegalPrice = await this.cybexjs.assetValue(
    //     this.base_id,
    //     this.currentOrderPrice
    //   );
    // },
    async fetchMarketTrades(base, quote) {
      let func = async () => {
        let row = 50;
        if (this.$refs.rowsContent) {
          row = this.$refs.rowsContent.clientHeight > 1000 ? 100 : 50;
        }
        let trades = await this.cybexjs.order_history(base, quote, row);
        this.trades = trades ? trades : [];
        // 最后成交价格
        // console.log('trades', trades);
        this.currentOrderPrice = trades.length
          ? parseFloat(trades[0].price)
          : null;
      };
      await func();
      // console.log(">>>>>> Market Trades 实时交易数据", this.trades);
      if (!this.intervalMarketTrade) {
        this.intervalMarketTrade = setInterval(async function() {
          await func();
        }, this.tradesRefreshRate);
      }
    }
  },
  computed: {
    ...mapGetters({
      baseCurrency: "exchange/base",
      quoteCurrency: "exchange/quote",
      base_id: "exchange/base_id",
      asset_is_custom: "exchange/asset_is_custom",
      base_digits: "exchange/base_digits",
      quote_id: "exchange/quote_id",
      quote_is_custom: "exchange/quote_is_custom",
      quote_digits: "exchange/quote_digits",
      tradesRefreshRate: "exchange/tradesRefreshRate"
    }),
    digitsPrice: function() {
      const defaultDigits = this.asset_is_custom ? 8 : 5;
      return this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "book",
        "last_price",
        defaultDigits
      );
    },
    digitsAmount: function() {
      const defaultDigits = this.asset_is_custom ? this.quote_digits : 5;
      return this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "book",
        "amount",
        defaultDigits
      );
    }
  }
};
</script>

<style lang="stylus" scoped>

@import '~assets/style/_fonts/_font_mixin';

.exchange-block-title {
  margin-bottom: 6px;
  width: calc(100% - 12px);
}

.trade-row-container {
  display: block;
  overflow-y: auto;
  height: calc(100% - 46px - 7px);
  f-cybex-style(heavy);
}

.trade-row {
  height: 20px;
  display: flex;
  align-items: center;
  line-height: 1.67;
  // f-cybex-style(roman);

  >span {
    display: inline-block;
    // opacity: 0.8;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    &:hover {
      &.price {
        opacity: 0.7;
      }
      cursor: pointer;
    }

    &.price {
      flex: 1 1 82px;
    }

    &.amount {
      flex: 1 1 50px;
      text-align: right;
      color: rgba(255, 255, 255, 0.8)
    }

    &.time {
      flex: 1 1 85px;
      text-align: right;
      padding-right: 16px;
    }
  }
}
</style>