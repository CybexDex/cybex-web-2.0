<template>
  <v-menu
    offset-y
    :max-width="maxWidth"
    :min-width="minWidth"
    v-model="isShowMarket"
    :open-on-click="false"
    :close-on-content-click="false"
  >
    <!-- 交易对名字显示开始 -->
    <v-flex grow="0" shrink="0" d-flex align-center class="control-item favorite" slot="activator">
      <span class="current-pairs mt-1" @click="toggleIsShowMarket">
        <asset-pairs
          :max-width="limitAssetSize ? '180px' : null"
          :max-quote-width="limitAssetSize ? '70%' : null"
          :base-id="base_id"
          :quote-id="quote_id"
        />
      </span>
      <v-icon
        class="arrow-icon ml-2"
        @click="toggleIsShowMarket"
      >{{ isShowMarket ? 'ic-arrow_up' : 'ic-arrow_drop_down' }}</v-icon>
    </v-flex>

    <!-- 详细比赛用交易对列表开始 -->
    <div class="market-panel">
      <v-flex class="tab-title-wrapper">
        <span class="tab-title active">{{ $t('tab_label.gamelist') }}</span>
      </v-flex>
      <div class="contest-asset-list">
        <v-data-table
          class="middle-size-table"
          :class="{'empty-table': marketRows.length === 0}"
          :headers="marketHeaders"
          :items="marketRows"
          :is-fixed-header-table="true"
          hide-actions
          :sort-icon="'ic-arrow_up'"
          :must-sort="true"
          :pagination.sync="pagination"
        >
          <template slot="items" slot-scope="props">
            <tr
              :class="props.item.quote === quote_id && props.item.base===base_id ? 'current-row' : 'select-row'"
              @click="onPairSelected($event, props.item)"
            >
              <!-- name -->
              <td :class="[marketHeaders[0].class, `text-xs-${marketHeaders[0].align}`]">
                <asset-pairs :base-id="props.item.base_symbol" :quote-id="props.item.quote_symbol"/>
              </td>
              <!-- volume -->
              <td
                :class="[marketHeaders[1].class, `text-xs-${marketHeaders[1].align}`]"
              >{{ props.item.base_volume | shortenVolume(props.item.asset_digits_volume) }}</td>
              <td
                :class="[marketHeaders[2].class, `text-xs-${marketHeaders[2].align}`]"
              >{{ parseFloat(props.item.latest) | roundDigits(props.item.asset_digits_price) | shortenPrice }}</td>
              <td
                :class="[marketHeaders[3].class, `text-xs-${marketHeaders[3].align}`]"
                class="text-xs-right col-change"
              >
                <v-flex d-flex :grow="0">
                  <span
                    class="price-change"
                    :class="!parseFloat(props.item.percent_change) ? 'c-grey' : (parseFloat(props.item.percent_change) > 0 ? 'c-buy' : 'c-sell')"
                  >
                    <v-icon
                      size="14"
                      :class="props.item.percent_change > 0 ? 'c-buy' : 'c-sell'"
                      v-if="!!parseFloat(props.item.percent_change)"
                    >{{ props.item.percent_change > 0 ? 'ic-arrow_up_green' : 'ic-arrow_down_red' }}</v-icon>
                    {{ props.item.percent_change | priceChange }}%
                  </span>
                </v-flex>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </div>
  </v-menu>
</template>

<script>
import { mapGetters } from "vuex";
import config from "~/lib/config/config.js";
import { map } from "lodash";
import utils from "~/components/mixins/utils";

export default {
  mixins: [utils],
  data() {
    return {
      maxWidth: 394,
      minWidth: 364,
      isShowMarket: false,
      intervalRefresh: null,
      // table
      pagination: {
        sortBy: "basevol",
        descending: true,
        rowsPerPage: -1
      },
      marketHeaders: [
        {
          text: this.$t("table_title.coin"),
          value: "quotename",
          sortable: false,
          align: "left",
          width: "100px"
        },
        {
          text: this.$t("table_title.volume"),
          value: "basevol",
          sortable: true,
          descending: true,
          align: "left",
          class: ["text-right", "pr-0"]
        },
        {
          text: this.$t("table_title.price"),
          value: "latest",
          sortable: false,
          align: "right"
        },
        {
          text: this.$t("table_title.change"),
          value: "percent_change",
          sortable: false,
          align: "right"
        }
      ],
      marketRows: []
    };
  },
  computed: {
    ...mapGetters({
      base_id: "exchange/base_id",
      quote_id: "exchange/quote_id",
      tradesRefreshRate: "exchange/tradesRefreshRate"
    }),
    limitAssetSize() {
      return this.mode == "exchange" && this.innerWidth <= 1440;
    },
    // 根据配置的指定交易对列表
    gameAssetList() {
      const assetList = config.gamePairs;
      let result = [];
      for (const item of assetList) {
        const [quote_id, base_id] = item;
        result.push({
          quote_id: quote_id,
          base_id: base_id
        });
      }
      return result;
    }
  },
  watch: {
    async isShowMarket(val) {
      // 打开的时候初始化下数据
      if (val) {
        await this.initData();
      } else {
        this.removeInterval();
      }
    }
  },
  beforeDestroy() {
    this.removeInterval();
  },
  methods: {
    async onPairSelected($event, item) {
      if (item.quote === this.quote_id && item.base === this.base_id) {
        $event.stopPropagation();
        return;
      }
      this.isShowMarket = false;
      this.$i18n.jumpTo(`/contest/${item.quote_symbol}_${item.base_symbol}`);
    },
    toggleIsShowMarket() {
      this.isShowMarket = !this.isShowMarket;
    },
    removeInterval() {
      if (this.intervalRefresh) {
        clearInterval(this.intervalRefresh);
        this.intervalRefresh = null;
      }
    },
    async fetchData(cleanData = false) {
      if (cleanData) {
        this.marketRows = [];
      }
      let res = [];
      return await Promise.all(
        map(this.gameAssetList, async row => {
          let r = await this.cybexjs.ticker(row.base_id, row.quote_id);
          const baseInfo = await this.cybexjs.queryAsset(row.base_id);
          const quoteInfo = await this.cybexjs.queryAsset(row.quote_id);
          r = Object.assign(r, {
            quote_symbol: quoteInfo.symbol,
            base_symbol: baseInfo.symbol,
            asset_digits_volume: this.getPairConfig(
              baseInfo.symbol,
              quoteInfo.symbol,
              "choose",
              "volume",
              2
            ),
            asset_digits_price: this.getPairConfig(
              baseInfo.symbol,
              quoteInfo.symbol,
              "choose",
              "last_price",
              6
            )
          });
          res.push(r);
        })
      ).then(() => {
        console.log("res", res);
        return res;
      });
    },
    async initData() {
      this.$eventHandle(this.fetchData, [true], {
        server: true,
        user: false
      }).then(res => {
        this.marketRows = res;
        // 打开的情况下循环获得数据
        if (!this.intervalRefresh && this.isShowMarket) {
          this.intervalRefresh = setInterval(
            async () => await this.fetchData(false),
            this.tradesRefreshRate
          );
        }
      });
    }
  }
};
</script>

<style lang="stylus" scoped>
.contest-asset-list {
  padding: 0 12px;
}
</style>
