<template>
  <div>
    <v-flex d-flex class="exchange-activity" justify-space-between>
      <!-- 正常交易市场显示选择下拉 -->
      <!-- 交易大赛显示固定交易选择 -->
      <MarketPanel v-if="!mode"/>
      <ContestMarketPanel v-else/>
      <div class="item column">
        <div class="exchange-list-head">{{ $t('exchange.content.latest-price') }}</div>
        <div
          class="price lg"
          :class="{'c-buy': currentIsUp === true, 'c-sell': currentIsUp === false}"
        >
          {{ currentOrderPrice | roundDigits(digitsLastPrice) }}
          <span
            class="c-highlight ml-1"
            v-if="currentOrderLegalPrice !== null"
          >{{ currentOrderLegalPrice | legalDigits(legalSymbol) }}</span>
        </div>
      </div>
      <div class="item column">
        <div class="exchange-list-head">{{ $t('exchange.content.24h-change') }}</div>
        <div
          class="price change lg"
          :class="{
            'c-buy': activityData.percent_change > 0,
            'c-sell': activityData.percent_change < 0}"
        >
          <v-flex class="data d-flex mr-1">
            {{ Math.abs(activityData.absolute_change) | roundDigits(digits24hChange) }}
            <span
              class="ic-arrow_up"
              v-if="activityData.percent_change > 0"
            />
            <span class="ic-arrow_drop_down" v-if="activityData.percent_change < 0"/>
            {{ activityData.percent_change > 0 ? '+' : '-' }}{{ Math.abs(activityData.percent_change) | roundDigits(2) }}%
          </v-flex>
          <!-- <span 
            v-if="currentIsUp === false" 
          class="ic-arrow_drop_down" />-->
        </div>
      </div>
      <div class="item column">
        <div class="exchange-list-head mt-1">
          <span class="tiny_label">{{ $t('exchange.content.24h-high') }}</span>
          <span
            class="price ml-1"
          >{{ activityData.high ? activityData.high : 0| roundDigits(digits24hChange) }}</span>
        </div>
        <div class="exchange-list-head ma-0">
          <span class="tiny_label">{{ $t('exchange.content.24h-low') }}</span>
          <span
            class="price ml-1"
          >{{ activityData.low ? activityData.low : 0 | roundDigits(digits24hChange) }}</span>
        </div>
      </div>
      <div class="item column">
        <div class="exchange-list-head">{{ $t("exchange.content.volume24h") }}:</div>
        <div class="price volume">
          {{ activityData.base_volume | roundDigits(digits24hVolume) }}
          <asset-pairs :max-width="'10vw'" :asset-id="baseCurrency"/>
        </div>
      </div>
    </v-flex>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import utils from "~/components/mixins/utils";
export default {
  data() {
    return {
      showMarket: false,
      currentIsUp: null
    };
  },
  props: {
    mode: {
      type: String,
      default: ""
    },
    activityData: {
      type: Object,
      default: () => {}
    }
  },
  mixins: [utils],
  components: {
    MarketPanel: () => import("~/components/MarketPanel.vue"),
    ContestMarketPanel: () =>
      import("~/components/contest/ContestMarketPanel.vue")
  },
  computed: {
    ...mapGetters({
      baseCurrency: "exchange/base",
      quoteCurrency: "exchange/quote",
      base_id: "exchange/base_id",
      quote_id: "exchange/quote_id",
      base_digits : "exchange/base_digits",
      quote_digits: "exchange/quote_digits",
      asset_is_custom: "exchange/asset_is_custom",
      currentOrderPrice: "exchange/currentRTEPrice",
      currentOrderLegalPrice: "exchange/currentRTELegalPrice",
      legalSymbol: "i18n/symbol"
    }),
    digitsLastPrice: function() {
      const defaultDigits = this.asset_is_custom ? 8 : 5;
      return this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "info",
        "last_price",
        defaultDigits
      );
    },
    digits24hChange: function() {
      const defaultDigits = this.asset_is_custom ? this.quote_digits : 5;
      return this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "info",
        "change",
        defaultDigits
      );
    },
    digits24hVolume: function() {
      const defaultDigits = this.asset_is_custom ? this.base_digits : 5;
      return this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "info",
        "volume",
        defaultDigits
      );
    }
  },
  watch: {
    currentOrderPrice: async function(newVal, oldVal) {
      if (newVal !== null && oldVal !== null) {
        let newV = parseFloat(newVal).toFixed(this.digitsLastPrice);
        let oldV = parseFloat(oldVal).toFixed(this.digitsLastPrice);
        if (newV === oldV) {
          this.currentIsUp = null;
        } else if (newV > oldV) {
          this.currentIsUp = true;
        } else if (newV < oldV) {
          this.currentIsUp = false;
        }
      }
    }
  },
  methods: {
    onShowMarket() {
      this.showMarket = true;
    }
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_vars/_vars';
@import '~assets/style/_vars/_colors';
@import '~assets/style/_fonts/_font_mixin';

// small size
.small-size {
  .exchange-list-head {
    margin: 3px 0 0;
  }

  .exchange-activity {
    height: small-activity-height;
  }
}

.tiny_label {
  min-width: 56px;
}

// normal size
.exchange-list-head {
  padding: 0;
  margin: 1px 0 3px;
  height: 16px;
}

.exchange-activity {
  height: activity-height;
  align-items: center;
  box-shadow: inset 0 -1px 0 0 #111621;

  a {
    text-decoration: none;
    color: white;
  }

  .price {
    &.lg {
      font-size: 14px;
    }

    // opacity: 0.8;
    &:not(.change) {
      color: white-opacity-80;
    }

    &.change {
      .data {
        display: flex;
        height: 14px;
        align-items: center;
      }

      .ic-arrow_up {
        color: exchange-buy;
        font-size: 20px;
        display: flex;
        top: -2px;
        left: -1px;
        position: relative;
        flex: 0 0 20px !important;

        &:before {
          color: exchange-buy;
        }
      }

      .ic-arrow_drop_down {
        color: exchange-sell;
        font-size: 20px;
        display: flex;
        top: 0px;
        left: -1px;
        position: relative;
        flex: 0 0 20px !important;

        &:before {
          color: exchange-sell;
        }
      }
    }

    &.volume {
      height: 14px;
      line-height: 1.33;
    }

    f-cybex-style(heavy);
  }
}

// market panel
.market-panel {
  overflow-y: hidden !important;
  background: $main.lead;
  height: 480px;
  border-radius: 4px;

  .tab-title-wrapper {
    padding: 16px 22px;
  }

  .tab-title {
    font-size: 16px;
    f-cybex-style('heavy');
    line-height: 32px;
    color: rgba($main.grey, 0.5);
    margin-right: 20px;
    cursor: pointer;
    transition: font-size 0.2s;

    &.active {
      font-size: 20px;
      color: $main.white;
    }
  }

  .content-tab {
    padding: 0 12px 0 12px;
  }

  .c-grey {
    color: rgba($main.white, 0.3);
  }

  .select-row {
    cursor: pointer;
  }

  .header-first {
    padding-left: 8px !important;
    text-align: left;
  }

  .header-last {
    padding-right: 6px !important;
    text-align: right;
  }

  .col-bookmark {
    margin-right: 4px;
    height: 15px;
    cursor: pointer;
  }

  .v-table__overflow {
    overflow-x: hidden;
    overflow-y: auto !important;
  }

  .current-row {
    background-color: rgba($main.white, 0.04) !important;
  }

  .v-table {
    .v-icon {
      max-width: 16px;
      max-height: 16px;
      min-width: 16px;
      min-height: 16px;

      &.action {
        opacity: 0.5;
      }
    }

    .v-icon:hover {
      &.action {
        opacity: 1;
      }
    }

    .col-change {
      min-width: 80px;
      padding: 0 8px 2px !important;

      .price-change {
        display: inline-block;
        word-break: keep-all;
        white-space: nowrap;
      }
    }
  }

  .v-tabs__bar {
    margin: 0 12px;

    .v-tabs__wrapper {
      background: $main.lead;
    }
  }

  .table-wrapper {
    overflow: auto;
    max-height: calc(480px - 151px);

    .ps {
      max-height: calc(480px - 151px);
    }

    &.no-tab {
      max-height: calc(480px - 110px);

      .ps {
        max-height: calc(480px - 110px);
      }
    }

    .v-table {
      table-layout: fixed;
    }
  }

  // custom pairs
  // add button
  .add-custom-icon {
    position: absolute;
    top: 12px;
    right: 16px;
  }

  .d-flex {
    .remove-custom-icon {
      flex-grow: 0 !important;
      flex-shrink: 1 !important;
    }
  }

  // add custom asset pairs
  .add-markets-wrapper {
    padding: 16px 12px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    width: 100%;
    height: 100%;
    transition: all 1s linear 0.3s;
    background-color: $main.lead;
    font-size: 12px;
    line-height: 16px;

    .tab-title {
      top: 4px;
      position: relative;
    }

    .input-label {
      f-cybex-style('heavy');
      font-size: 12px;
      color: rgba($main.white, 0.8);
      margin-bottom: 12px;
    }

    .spacer {
      display: inline-block;
      line-height: 28px;
      font-size: 18px;
      opacity: 0.4;
      text-align: center;
      min-width: 8px;
    }

    .add-markets-error {
      position: absolute;
      height: 100%;
      top: 0;
      width: 100%;
      background: #1b2230;
    }

    .add-markets-desc {
      color: rgba($main.white, 0.5);
      position: relative;
      line-height: 1.71;
      max-width: 90%;

      .v-icon.ic-grey-feedback {
        min-width: 20px;
        margin-right: 8px;
      }
    }

    .add-market-btn {
      position: absolute;
      right: 12px;
      bottom: 24px;
    }

    .v-messages {
      display: none;
    }
  }
}

.control-item {
  display: flex;
  flex: 1 1 auto;

  &.favorite {
    align-items: center;
    min-width: 55%;
    font-size: 14px;

    .v-btn {
      margin: 0px !important;
    }

    >span {
      cursor: pointer;
      f-cybex-style('heavy');
    }

    .current-pairs {
      font-size: 14px;
      f-cybex-style('black', 'heavy');
      flex: 0 1 auto !important; 
    }

    .marked-icon {
      .v-icon {
        font-size: 1.6em;

        &:before {
          color: $main.orange !important;
        }

        &.ic-star:before {
          color: $main.grey;
        }
      }
    }

    .arrow-icon.v-icon:before {
      color: $main.orange !important;
    }
  }

  &.column {
    flex-direction: column;
  }
}
</style>