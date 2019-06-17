<template>
  <div
    class="orders-table-container"
    :class="{empty: !rowsData || rowsData.length == 0, 'full-mode': mode === 'full', 'elevation-1': mode === 'full'}"
  >
    <v-flex d-flex ref="fixHeader" class="fixed-header" :class="{hidden: !showFixedHeader}">
      <div
        v-for="(header, idx) of headers"
        :key="idx"
        :class="{'text-left': header.align == 'left', 'text-center': header.align == 'center', 'text-right': header.align == 'right'}"
      >
        <div
          v-if="header.text"
          class="col-header"
          :class="'col-field-'+header.value"
        >{{ header.text }}</div>
        <div v-if="header.action" class="col-header" :class="'col-field-'+header.value">
          <cybex-btn
            tiny
            color="minor"
            :disabled="rowsData.length === 0"
            @click="confirmCancelAllOrder"
          >{{ $t("exchange.order-table.column.cancel") }}</cybex-btn>
        </div>
      </div>
    </v-flex>
    <perfect-scrollbar ref="scrollEle" :options="{minScrollbarLength: 30, useBothWheelAxes: true}">
      <v-data-table
        class="middle-size-table"
        :class="{'empty-table': !rowsData || rowsData.length == 0}"
        :headers="headers"
        :items="rowsData"
        hide-actions
      >
        <template slot="headerCell" slot-scope="props">
          <template v-if="props.header.text">{{ props.header.text }}</template>
          <template v-if="props.header.action">
            <cybex-btn
              tiny
              color="minor"
              class="cancel-all"
              :disabled="rowsData.length === 0"
              @click="confirmCancelAllOrder"
            >{{ $t("exchange.order-table.column.cancel") }}</cybex-btn>
          </template>
        </template>
        <template slot="items" slot-scope="props">
          <tr>
            <td class="text-xs-left col-date">{{ props.item.time | date('DD/MM HH:mm:ss') }}</td>
            <td class="text-xs-left">
              <asset-pairs
                :max-width="limitAssetSize ? '100px' : null" :max-quote-width="limitAssetSize ? '50px' : null"
                :quote-id="props.item.market.quote"
                :spacer="false"
                :base-id="props.item.market.base"
              />
            </td>
            <!-- 卖单向上取整，买单向下取整 -->
            <template v-if="props.item.tradetype == 'buy'">
              <td
                class="text-xs-center text-uppercase c-buy"
              >{{ $t('exchange.content.' + props.item.tradetype.toLowerCase()) }}</td>
              <td
                class="text-xs-center"
              >{{ props.item.price | floorDigits(props.item.asset_digit_price) | shortenPrice }}</td>
              <td
                class="text-xs-center"
              >{{ props.item.amount | floorDigits(props.item.asset_digit_amount) }}</td>
              <td class="text-xs-center">{{ props.item.filled * 100 | floorDigits(2) }}%</td>
              <td
                class="text-xs-right"
              >{{ props.item.total | floorDigits(props.item.asset_digit_total) }}</td>
            </template>
            <template v-else>
              <td
                class="text-xs-center text-uppercase c-sell"
              >{{ $t('exchange.content.' + props.item.tradetype.toLowerCase()) }}</td>
              <td
                class="text-xs-center"
              >{{ props.item.price | ceilDigits(props.item.asset_digit_price) | shortenPrice }}</td>
              <td
                class="text-xs-center"
              >{{ props.item.amount | ceilDigits(props.item.asset_digit_amount) }}</td>
              <td class="text-xs-center">{{ props.item.filled * 100 | floorDigits(2) }}%</td>
              <td class="text-xs-right">{{ props.item.total | ceilDigits(props.item.asset_digit_total) }}</td>
            </template>
            <td class="text-xs-right">
              <v-btn icon class="mr-4 cancel-one" @click="confirmCancelOrder(props.item)" small>
                <v-icon size="16">ic-cancel</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
        <template slot="no-data">
          <Loading v-if="isLoading"/>
          <div class="no-data pt-2" v-else>{{ $t('exchange.order-table.no-open-data') }}</div>
        </template>
      </v-data-table>
    </perfect-scrollbar>
    <!-- 确认取消订单-->
    <v-dialog width="400" dark v-model="confirmDialog">
      <v-card>
        <v-card-title class="headline">{{ $t('exchange.dialog.confirm-cancel') }}</v-card-title>
        <v-card-actions>
          <v-flex d-flex justify-space-between>
            <v-flex d-flex class="actions m-l">
              <cybex-btn
                small
                class="cancel"
                color="pre-minor"
                @click="confirmDialog = false"
              >{{ $t('exchange.dialog.Cancel') }}</cybex-btn>
            </v-flex>
            <v-flex d-flex class="actions">
              <cybex-btn
                small
                color="major"
                :disabled="isCanceling"
                @click="clickCancelOrder"
              >{{ $t('exchange.dialog.OK') }}</cybex-btn>
            </v-flex>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 确认取消所有订单-->
    <v-dialog width="400" dark v-model="confirmCancelAllDialog">
      <v-card>
        <v-card-title class="headline">{{ $t('exchange.dialog.confirm-cancel-all') }}</v-card-title>
        <v-card-actions>
          <v-flex d-flex justify-space-between>
            <v-flex d-flex class="actions m-l">
              <cybex-btn
                small
                class="cancel"
                color="pre-minor"
                @click="confirmCancelAllDialog = false"
              >{{ $t('exchange.dialog.Cancel') }}</cybex-btn>
            </v-flex>
            <v-flex d-flex class="actions">
              <cybex-btn
                small
                color="major"
                :disabled="isCanceling"
                @click="clickCancelOrder"
              >{{ $t('exchange.dialog.OK') }}</cybex-btn>
            </v-flex>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { values, map, filter, find, isEqual, isEqualWith, reverse } from 'lodash';
import utils from "~/components/mixins/utils";
import config from "~/lib/config/config.js";

export default {
  props: {
    mode: {
      type: String,
      default: "exchange"
    },
    enableInterval: {
      type: Boolean,
      default: false
    },
    orderFilter: {
      type: Object,
      default: () => {}
    },
    whiteFlag: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showFixedHeader: false,
      currentFilter: {
        base_id: null,
        quote_id: null
      },
      intervalFetchData: null,
      confirmDialog: false,
      confirmCancelAllDialog: false,
      needCancelAllDialog: false,
      needCancelDialog: false,
      cancelIds: [],
      headers: [
        {
          text: this.$t("exchange.order-table.column.date"),
          align: "left",
          sortable: false,
          value: "time",
          width: '104px'
        },
        {
          text: this.$t("exchange.order-table.column.pair"),
          align: "left",
          sortable: false,
          value: "market"
        },
        {
          text: this.$t("exchange.order-table.column.side"),
          align: "center",
          sortable: false,
          value: "tradetype",
          width: "42px"
        },
        {
          text: this.$t("exchange.order-table.column.price"),
          align: "center",
          sortable: false,
          value: "price"
        },
        {
          text: this.$t("exchange.order-table.column.amount"),
          align: "center",
          sortable: false,
          value: "amount"
        },
        {
          text: this.$t("exchange.order-table.column.filled"),
          align: "center",
          sortable: false,
          value: "filled",
          width: "100px"
        },
        {
          text: this.$t("exchange.order-table.column.total"),
          align: "right",
          sortable: false,
          value: "total"
        },
        { action: true, align: "right", sortable: false, value: "cancel", width: '100px' }
      ],
      rowsData: [],
      isLoading: this.username !== null && this.username !== "",
      isCanceling: false,
    };
  },
  computed: {
    ...mapGetters({
      whitelist: "user/whitelist",
      bases: "user/bases",
      coinMap: "user/coins",
      coinMapInvert: "user/coinsInvert",
      username: "auth/username",
      baseCurrency: "exchange/base",
      quoteCurrency: "exchange/quote",
      isLocked: "auth/islocked",
      freshRate: "exchange/tradesRefreshRate",
      innerWidth: "exchange/innerWidth"
    }),
    limitAssetSize(){
      return this.mode == 'exchange' && this.innerWidth <= 1440;
    },
  },
  components: {
    Loading: () => import("~/components/exchange/ExchangeLoading.vue")
  },
  watch: {
     // 用户名变化时 重新拉取数据
    username: async function(){
      this.removeInterval();
      await this.initData();
    },
    bases: function(v) {
      console.log("bases change", v);
    },
    isLocked: function(v) {
      if (!v && this.needCancelAllDialog) {
        this.confirmCancelAllDialog = true;
        this.needCancelAllDialog = false;
      }
      if (!v && this.needCancelDialog) {
        this.confirmDialog = true;
        this.needCancelDialog = false;
      }
    },
    enableInterval: async function(val) {
      if (val === true && this.mode === "exchange") {
        // console.log('可以轮询 open order');
        await this.initData(false, true);
      } else {
        console.log("不可以轮询 open order");
        this.removeInterval();
      }
    },
    orderFilter: function(filter) {
      let tryTimes = 5;
      this.currentFilter = Object.assign(this.currentFilter, filter);
      this.$eventHandle(() => this.fetchOrderHistory(true, true))
        .then(() => {
          tryTimes = 0;
        })
        .catch(e => {
          this.isLoading = false;
        });
    },
    rowsData: function(v) {
      this.$emit("update-row-length", v.length);
      if (v.length) {
        this.$nextTick(() => {
          if (this.$refs.scrollEle) {
            this.$refs.scrollEle.$el.addEventListener(
              "ps-y-reach-start",
              () => {
                this.showFixedHeader = false;
              }
            );
            this.$refs.scrollEle.$el.addEventListener(
              "ps-scroll-y",
              this.onFixedHeader
            );
          }
        });
      } else {
        this.showFixedHeader = false;
        this.$refs.scrollEle.$el.removeEventListener("ps-y-reach-start", () => {
          this.showFixedHeader = false;
        });
        this.$refs.scrollEle.$el.removeEventListener(
          "ps-scroll-y",
          this.onFixedHeader
        );
        this.$nextTick(() => {
          this.$refs.scrollEle.$el.scrollTop = 0;
        });
      }
    }
  },
  methods: {
    onFixedHeader: function() {
      if (this.$refs.scrollEle.$el && this.$refs.fixHeader) {
        const cols = this.$refs.scrollEle.$el.querySelectorAll(
          "[role='columnheader']"
        );
        const headers = this.$refs.fixHeader.querySelectorAll(".col-header");
        headers.forEach((ele, idx) => {
          headers[idx].style.width = cols[idx].clientWidth + "px";
        });
        this.showFixedHeader = true;
      }
    },
    filterDataByWhiteFlag(rows){
      if (this.whiteFlag == '') return rows;
      const whitelist = values(this.whitelist);
      const gamelist = config.gamePairs;
      rows = filter(rows, (row) => {
        const [base, quote] = [row.market.base, row.market.quote];
        let r = false;
        // 是否是交易大赛的交易对
        const isInGameList = find(gamelist, (item) => {
          return isEqualWith(item, [quote, base], (oneItem, otherItem) => {
            return isEqual(oneItem, otherItem) ||  isEqual(oneItem, reverse(otherItem));
          });
        });
        // 是否是白名单列表中的交易对
        // quote base顺序正反都可以视作官方交易对，所以检查2次
        let toSearchObj;
        let toSearchAsset;
        if (this.bases[base]) {
          toSearchObj = this.bases[base].data;
          toSearchAsset = quote;
        } else if (this.bases[quote]) {
          toSearchObj = this.bases[quote].data;
          toSearchAsset = base;
        }
        let isWhiteInRowCondition = false;
        if (toSearchObj) {
          isWhiteInRowCondition = find(toSearchObj, toSearch => {
            return toSearch.indexOf(toSearchAsset) > -1;
          });
        }
        switch(this.whiteFlag) {
          case 'game':
            r = isInGameList !== undefined;
            break;
          case 'white':
            r = isWhiteInRowCondition && isInGameList == undefined;
            break;
          case 'custom':
          default:
            r = !isWhiteInRowCondition && isInGameList == undefined;
        }
        return r;
      })
      return rows;
    },
    async mapRowAssetDigits(rows) {
      // 增加资产精度
      await Promise.all(
        map(rows, async (item, idx) => {
          const k = "asset-" + item.market.base;
          const k2 = "asset-" + item.market.quote;
          if (!this.staticDigits[k]) {
            let r = await this.cybexjs.queryAsset(item.market.base);
            this.staticDigits[k] = r.precision;
          }
          if (!this.staticDigits[k2]) {
            let r = await this.cybexjs.queryAsset(item.market.quote);
            this.staticDigits[k2] = r.precision;
          }
          rows[idx]["asset_digit_base"] = this.staticDigits[k];
          rows[idx]["asset_digit_quote"] = this.staticDigits[k2];
          // price精度
          let dp = this.digitsPrice(item);
          rows[idx]["asset_digit_price"] = dp;
          // amount精度
          let da = this.digitsAmount(item);
          rows[idx]["asset_digit_amount"] = da;
          // total精度
          let dt = this.digitsTotal(item);
          rows[idx]["asset_digit_total"] = dt;
        })
      );
    },
    digitsPrice: function(item) {
      const base =
        item && item.market
          ? this.coinName(item.market.base, this.coinMap)
          : this.baseCurrency;
      const quote =
        item && item.market
          ? this.coinName(item.market.quote, this.coinMap)
          : this.quoteCurrency;
      const defaultDigits = this.isCustomPair(item.market.base, item.market.quote)
        ? 8
        : 5;
      return this.getPairConfig(
        base,
        quote,
        "book",
        "last_price",
        defaultDigits
      );
    },
    digitsAmount: function(item) {
      const base = item
        ? this.coinName(item.market.base, this.coinMap)
        : this.baseCurrency;
      const quote = item
        ? this.coinName(item.market.quote, this.coinMap)
        : this.quoteCurrency;
      const defaultDigits = this.isCustomPair(item.market.base, item.market.quote)
        ? item.asset_digit_quote
        : 5;
      return this.getPairConfig(base, quote, "book", "amount", defaultDigits);
    },
    digitsTotal: function(item) {
      const base =
        item && item.market
          ? this.coinName(item.market.base, this.coinMap)
          : this.baseCurrency;
      const quote =
        item && item.market
          ? this.coinName(item.market.quote, this.coinMap)
          : this.quoteCurrency;
       const defaultDigits = this.isCustomPair(item.market.base, item.market.quote)
        ? item.asset_digit_base
        : 5;    
      return this.getPairConfig(base, quote, "book", "total", defaultDigits);
    },
    confirmCancelAllOrder: function() {
      if (this.rowsData.length === 0) return;
      this.cancelIds = [];
      this.rowsData.forEach(item => {
        this.cancelIds.push(item.id);
      });
      if (this.isLocked) {
        // 弹出解锁框
        this.needCancelAllDialog = true;
        this.$toggleLock();
      } else {
        this.confirmCancelAllDialog = true;
      }
    },
    confirmCancelOrder: function(order) {
      this.cancelIds = [order.id];
      // 检查用户是否已锁
      if (this.isLocked) {
        // 弹出解锁狂
        this.needCancelDialog = true;
        this.$toggleLock();
      } else {
        this.confirmDialog = true;
      }
    },
    clickCancelOrder() {
      const deal = () => {
        this.refreshOrder();
        this.confirmDialog = false;
        this.confirmCancelAllDialog = false;
        setTimeout(() => (this.isCanceling = false), 1000);
      };
      this.isCanceling = true;
      this.$eventHandle(this.cancelOrder)
        .then(() => {
          this.$message({
            message: this.$t("message.order_canceled"),
            type: "success"
          });
          deal();
        })
        .catch(e => {
          // 多签用户报错使用默认弹窗
          if (!e.user) {
            this.$message({
              message: this.$t("message.order_canceled_failed"),
              type: "error"
            });
          }
          deal();
        });
    },
    cancelOrder: async function() {
      if (this.cancelIds) {
        return Promise.all(
          this.cancelIds.map(async id => {
            let result = await this.cybexjs.cancel_order(id);
          })
        );
      }
    },
    initData: async function(cleanRows = true, showLoading = true) {
      let times = 5,
        stop = false;
      while (times > 0 && !stop) {
        await this.$eventHandle(() =>
          this.fetchOrderHistory(cleanRows, showLoading)
        )
          .then(() => {
            stop = true;
            times = 0;
          })
          .catch(e => {
            console.log("network error, requesting again");
            times--;
            this.$eventHandle(() =>
              this.fetchOrderHistory(cleanRows, showLoading)
            );
          });
      }
      if (times !== 0) {
        this.$store.commit("exchange/SET_CONNECT_STATUS", {
          orderConnect: false
        });
      } else {
        this.$store.commit("exchange/SET_CONNECT_STATUS", {
          orderConnect: true
        });
      }
    },
    async fetchOrderHistory(cleanRows = true, showLoading = false) {
      if (!this.username) {
        this.rowsData = [];
        this.isLoading = false;
        return;
      }

      let func = async (needCleanData = false, needShowLoading = false) => {
        if (needCleanData) {
          this.rowsData = [];
        }
        if (needShowLoading) {
          this.isLoading = true;
        }
        // open orders
        // console.log('this.currentFilter', this.currentFilter);
        let openRows = await this.cybexjs.getOpenOrder(
          this.username,
          this.currentFilter.base_id,
          this.currentFilter.quote_id
        );
        openRows = this.filterDataByWhiteFlag(openRows);
        await this.mapRowAssetDigits(openRows);
        // console.log('open rows', this.enableInterval, openRows);
        this.isLoading = false;
        this.rowsData = openRows ? openRows : [];
      };
      await func(cleanRows, showLoading);
      if (!this.intervalFetchData && this.enableInterval) {
        this.intervalFetchData = setInterval(async () => {
          await func();
        }, this.freshRate);
      }
    },
    async refreshOrder() {
      // 刷新Open order
      if (!this.username) {
        this.rowsData = [];
        return;
      }
      // open orders
      let openRows = await this.cybexjs.getOpenOrder(
        this.username,
        this.orderFilter ? this.orderFilter.base_id : this.base_id,
        this.orderFilter ? this.orderFilter.quote_id : this.quote_id
      );
      await this.mapRowAssetDigits(openRows);
      this.rowsData = openRows ? openRows : [];
    },
    async bindIntervalEvent(){
      if (document.visibilityState == "hidden") {
        this.removeInterval();
      } else if (document.visibilityState == "visible") {
        await this.initData();
      }
    },
    removeInterval() {
      if (this.intervalFetchData) {
        clearInterval(this.intervalFetchData);
        this.intervalFetchData = null;
      }
    }
  },
  mixins: [utils],
  async mounted() {
    await this.initData();
    document.addEventListener("visibilitychange", this.bindIntervalEvent);

  },
  beforeDestroy() {
    document.removeEventListener("visibilitychange",this.bindIntervalEvent);
    clearInterval(this.intervalFetchData);
  }
};
</script>