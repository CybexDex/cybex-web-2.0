<template>
  <div
    class="orders-table-container has_filter"
    :class="{empty: !rowsData || rowsData.length == 0, 'elevation-1': mode === 'full'}"
  >
    <!-- filter exchange -->
    <v-flex v-if="mode !='full'" class="filters">
      <v-flex class="flex-label">
        <span @click="searchByDate('day')" v-html="$t('exchange.order-table.filter.1-day')"/>
        <span @click="searchByDate('week')" v-html="$t('exchange.order-table.filter.1-week')"/>
        <span @click="searchByDate('month')" v-html="$t('exchange.order-table.filter.1-month')"/>
        <span
          @click="searchByDate('3 months')"
          v-html="$t('exchange.order-table.filter.3-months')"
        />
      </v-flex>
      <v-flex class="date" d-flex>
        <span class="c-white-30 mr-2">{{ $t('exchange.order-table.filter.from') }}</span>
        <!-- start date-->
        <v-menu
          ref="refStartMenu"
          class="date-time mr-2"
          :close-on-content-click="false"
          v-model="startMenu"
          :nudge-top="376"
          :nudge-left="175"
          color="#212939"
          :return-value.sync="startDate"
          lazy
          transition="slide-y-reverse-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <cybex-text-field
            tiny
            no-message
            slot="activator"
            v-model="startdateDisplayFormatted"
            readonly
          />
          <v-date-picker 
            :min="limitDate"
            :max="endDate"
            :reactive="true"
            next-icon="ic-chevron_right"
            prev-icon="ic-chevron_left"
            color="cybex-date-time"
            v-model="startDate" 
            no-title 
            scrollable>
            <v-spacer/>
            <v-btn flat color="#78819A" @click="startMenu = false"> {{ $t('exchange.dialog.Cancel') }} </v-btn>
            <v-btn flat color="#78819A" @click="$refs.refStartMenu.save(startDate)"> {{ $t('exchange.dialog.OK') }}</v-btn>
          </v-date-picker>
        </v-menu>
        <!-- end date-->
        <v-menu
          ref="refEndMenu"
          class="date-time"
          :close-on-content-click="false"
          v-model="endMenu"
          :nudge-top="376"
          :nudge-left="175"
          :return-value.sync="endDate"
          lazy
          transition="slide-y-reverse-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <cybex-text-field
            tiny
            no-message
            slot="activator"
            v-model="enddateDisplayFormatted"
            readonly
          />
          <v-date-picker 
            :min="startDate"
            :max="today"
            :reactive="true"
            next-icon="ic-chevron_right"
            prev-icon="ic-chevron_left"
            color="cybex-date-time"
            v-model="endDate"
            no-title 
            scrollable>
            <v-spacer/>
            <v-btn flat color="#78819A" @click="endMenu = false">{{ $t('exchange.dialog.Cancel') }}</v-btn>
            <v-btn flat color="#78819A" @click="$refs.refEndMenu.save(endDate)">{{ $t('exchange.dialog.OK') }}</v-btn>
          </v-date-picker>
        </v-menu>
        <v-btn ripple @click="updateOrderHistory()" icon>
          <v-icon d-flex size="20" v-text="'ic-search'"/>
        </v-btn>
      </v-flex>
    </v-flex>
    <!-- filter full page -->
    <v-flex v-else class="filters">
      <v-flex class="date" d-flex>
        <span class="c-white-30 mr-2">{{ $t('exchange.order-table.filter.time') }}:</span>
        <!-- start date-->
        <v-menu
          ref="refStartMenu"
          class="date-time"
          :close-on-content-click="false"
          v-model="startMenu"
          color="#212939"
          :return-value.sync="startDate"
          :nudge-bottom="12"
          lazy
          transition="slide-y-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <cybex-text-field 
            tiny
            no-message
            slot="activator" v-model="startdateDisplayFormatted" readonly/>
          <v-date-picker
            :min="limitDate"
            :max="endDate"
            :reactive="true"
            next-icon="ic-chevron_right"
            prev-icon="ic-chevron_left"
            color="cybex-date-time" 
            v-model="startDate"
            no-title
            scrollable
          >
            <v-spacer/>
            <v-btn flat color="#78819A" @click="startMenu = false">{{ $t('exchange.dialog.Cancel') }}</v-btn>
            <v-btn flat color="#78819A" @click="$refs.refStartMenu.save(startDate)">{{ $t('exchange.dialog.OK') }}</v-btn>
          </v-date-picker>
        </v-menu>
        <span class="ml-1 mr-1">-</span>
        <!-- end date-->
        <v-menu
          class="date-time"
          ref="refEndMenu"
          :close-on-content-click="false"
          v-model="endMenu"
          :nudge-bottom="12"
          :return-value.sync="endDate"
          lazy
          transition="slide-y-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <cybex-text-field 
            no-message
            tiny
            slot="activator" v-model="enddateDisplayFormatted" readonly/>
          <v-date-picker 
            :min="startDate"
            :max="today"
            :reactive="true"
            v-model="endDate" 
            next-icon="ic-chevron_right"
            prev-icon="ic-chevron_left"
            color="cybex-date-time"
            no-title 
            scrollable>
            <v-spacer/>
            <v-btn flat color="#78819A" @click="endMenu = false">{{ $t('exchange.dialog.Cancel') }}</v-btn>
            <v-btn flat color="#78819A" @click="$refs.refEndMenu.save(endDate)">{{ $t('exchange.dialog.OK') }}</v-btn>
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-layout row align-center>
        <BaseQuoteSelector v-model="selectedPair" v-if="whiteFlag === 'white'"/>
        <ContestBaseQuoteSelector :size="'small'" v-model="selectedPair" v-else-if="whiteFlag === 'game'"/>
        <CustomBaseQuoteSelector :size="'small'" game-only v-model="selectedPair" v-else-if="whiteFlag === 'custom'"/>
        <v-flex>
          <cybex-btn
            tiny
            :disabled="couldSearchHistory"
            class="search mr-2 text-capitalize"
            @click="updateOrderHistory()"
          >{{ $t('exchange.content.search') }}</cybex-btn>
          <cybex-btn 
            tiny
            color="minor"
            class="reset ma-0 text-capitalize" @click="resetSelectContent()">{{ $t('exchange.content.reset') }}</cybex-btn>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-flex
      d-flex
      ref="fixHeader"
      class="fixed-header has_filter"
      :class="{hidden: !showFixedHeader}"
    >
      <div
        v-for="(header, idx) of headers"
        :key="idx"
        :class="{'text-left': header.align == 'left', 'text-center': header.align == 'center', 'text-right': header.align == 'right'}"
      >
        <div class="col-header" :class="'col-field-'+header.value">{{ header.text }}</div>
      </div>
    </v-flex>
    <perfect-scrollbar ref="scrollEle" :options="{minScrollbarLength: 20}">
      <v-data-table
        :headers="headers"
        :items="rowsData"
        hide-actions
        class="has_filter middle-size-table"
        :class="{'empty-table': !rowsData || rowsData.length == 0}"
      >
        <template slot="headerCell" slot-scope="props">{{ props.header.text }}</template>
        <template slot="items" slot-scope="props">
          <tr :class="{'c-cancel-order': props.item.status.toLowerCase() == 'canceled'}">
            <td class="col-date">{{ props.item.time | date('DD/MM HH:mm:ss') }}</td>
            <td
              class="text-xs-left"
            ><asset-pairs 
              :max-width="limitAssetSize ? '100px': null"
              :max-quote-width="limitAssetSize ? '40px': null"
              :color-opacity="props.item.status.toLowerCase() == 'canceled' ? 0.5 : 1" 
              :quote-id="props.item.market.quote" :spacer="false" 
              :base-id="props.item.market.base" /></td>
            <td
              class="text-xs-left text-uppercase"
              :class="{ 
                'c-buy': props.item.tradetype == 'buy',
                'c-sell': props.item.tradetype == 'sell'}"
            >{{ $t('exchange.content.' + props.item.tradetype.toLowerCase()) }}</td>
            <td
              class="text-xs-left"
            >{{ props.item.average | roundDigits(props.item.asset_digit_price, null, '--') | shortenPrice }}</td>
            <td class="text-xs-left">{{ props.item.price | roundDigits(props.item.asset_digit_price) | shortenPrice }}</td>
            <td class="text-xs-left">{{ props.item.filled | roundDigits(props.item.asset_digit_amount) }}</td>
            <td class="text-xs-left">{{ props.item.amount | roundDigits(props.item.asset_digit_amount) }}</td>
            <td
              class="text-xs-right"
            >{{ props.item.total | roundDigits(props.item.asset_digit_base) }}</td>
            <td
              class="text-xs-right"
            >{{ $t('exchange.order-table.order-status-' + props.item.status.toLowerCase()) }}</td>
          </tr>
        </template>

        <template slot="no-data">
          <Loading v-if="isLoading"/>
          <div class="no-data" v-else>{{ $t('exchange.order-table.no-close-data') }}</div>
        </template>
      </v-data-table>
    </perfect-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import utils from "~/components/mixins/utils";
import { last } from "lodash";
import moment from "moment";
import {
  isEqual,
  differenceWith,
  filter,
  sum,
  keys,
  values,
  map,
  concat,
  uniqBy
} from "lodash";

export default {
  components: {
    BaseQuoteSelector: () => import("~/components/BaseQuoteSelector.vue"),
    Loading: () => import("~/components/exchange/ExchangeLoading.vue"),
    CustomBaseQuoteSelector: () => import("~/components/CustomBaseQuoteSelector.vue"),
    ContestBaseQuoteSelector: () => import("~/components/ContestBaseQuoteSelector.vue")
  },
  props: {
    mode: {
      type: String,
      default: "exchange" // exchange | game | full
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
      intervalRefresh: null,
      rowsData: [],
      isLoading: this.username != "" && this.username != null,
      bindPageEvent: false, // 是否绑定过翻页函数
      nextpage: false, // 是否在读取下一页
      startMenu: false, // 控制日历控件开关
      endMenu: false, // 控制日历控件开关
      limitDate: new Date(new Date().setMonth(new Date().getMonth() - 3))
        .toISOString()
        .substr(0, 10),
      today: new Date()
        .toISOString()
        .substr(0, 10),
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3))
        .toISOString()
        .substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
      // 表格数据 header设定
      headers: [
        {
          text: this.$t("exchange.order-table.column.date"),
          align: "left",
          sortable: false,
          value: "date",
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
          align: "left",
          sortable: false,
          value: "tradetype",
          width: '42px'
        },
        {
          text: this.$t("exchange.order-table.column.average"),
          align: "left",
          sortable: false,
          value: "average"
        },
        {
          text: this.$t("exchange.order-table.column.price"),
          align: "left",
          sortable: false,
          value: "price"
        },
        {
          text: this.$t("exchange.order-table.column.fillamount"),
          align: "left",
          sortable: false,
          value: "filled"
        },
        {
          text: this.$t("exchange.order-table.column.amount"),
          align: "left",
          sortable: false,
          value: "amount"
        },
        {
          text: this.$t("exchange.order-table.column.total"),
          align: "right",
          sortable: false,
          value: "total"
        },
        {
          text: this.$t("exchange.order-table.column.status"),
          align: "right",
          sortable: false,
          value: "status",
          width: "65px"
        }
      ],
      page: 0,
      limit: 20,
      // 搜索框
      selectedPair: { base_id: "", quote_id: "" },
      // 当前使用的filter
      currentFilter: null
    };
  },
  computed: {
    ...mapGetters({
      bases: "user/bases",
      coinMap: "user/coins",
      coinsInvert: "user/coinsInvert",
      username: "auth/username",
      baseCurrency: "exchange/base",
      quoteCurrency: "exchange/quote",
      base_id: "exchange/base_id",
      quote_id: "exchange/quote_id",
      refreshRate: "exchange/tradesRefreshRate",
      locale: "i18n/locale",
      innerWidth: "exchange/innerWidth"
    }),
    limitAssetSize(){
      return this.mode == 'exchange' && this.innerWidth <= 1680;
    },
    couldSearchHistory: function() {
      if (this.whiteFlag !== 'custom') return false;
      return (this.selectedPair.base_id === "" && this.selectedPair.quote_id === ""
           || (this.selectedPair && this.selectedPair.base_id && this.selectedPair.quote_id )) ? false : true;
    },
    filter: function() {
      return Object.assign({}, this.orderFilter, {
        start: null,
        end: null,
        base_id:
          this.mode == "exchange"
            ? this.orderFilter.base_id
            : this.selectedPair.base_id
            ? this.selectedPair.base_id
            : null,
        quote_id:
          this.mode == "exchange"
            ? this.orderFilter.quote_id
            : this.selectedPair.quote_id
            ? this.selectedPair.quote_id
            : null,
        white_flag:
          this.whiteFlag
      });
    },
    enddateDisplayFormatted: function() {
      return this.formatDate(this.endDate, this.dateDisplayFormat);
    },
    startdateDisplayFormatted: function() {
      return this.formatDate(this.startDate, this.dateDisplayFormat);
    }
  },
  watch: {
     // 用户名变化时 重新拉取数据
    username: async function(){
      this.removeInterval();
      await this.initData();
    },
    rowsData(newVal) {
      if (newVal.length) {
        this.$nextTick(() => {
          if (!this.bindPageEvent) {
            this.bindPageEvent = true;
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
              this.$refs.scrollEle.$el.addEventListener(
                "ps-scroll-x",
                this.onFixedHeader
              );
              this.$refs.scrollEle.$el.addEventListener(
                "ps-y-reach-end",
                this.onScroll
              );
            }
          }
        });
      } else {
        // 取消滚动条绑定事件防止读取完数据后触发onscroll事件
        this.bindPageEvent = false;
        this.showFixedHeader = false;
        if (this.$refs.scrollEle) {
          this.$refs.scrollEle.$el.removeEventListener(
            "ps-y-reach-end",
            this.onScroll
          );
          this.$refs.scrollEle.$el.removeEventListener(
            "ps-y-reach-start",
            () => {
              this.showFixedHeader = false;
            }
          );
          this.$refs.scrollEle.$el.removeEventListener(
            "ps-scroll-y",
            this.onFixedHeader
          );
          this.$refs.scrollEle.$el.removeEventListener(
            "ps-scroll-x",
            this.onFixedHeader
          );
          this.$nextTick(() => {
            this.$refs.scrollEle.$el.scrollTop = 0;
          });
        }
      }
    },
    enableInterval: async function(val) {
      if (val === true && this.mode === "exchange") {
        // console.log('可以轮询 order');
        await this.initData();
      } else {
        // console.log('不可以轮询 order');
        this.removeInterval();
      }
    },
    orderFilter: function(v) {
      this.rowsData = [];
      if (!this.currentFilter) {
        this.currentFilter = v;
      } else {
        Object.assign(this.currentFilter, {
          base_id: v ? v.base_id : null,
          quote_id: v ? v.quote_id : null
        });
      }
      this.$eventHandle(this.fetchOrderHistory, ["", true]);
    }
  },
  async bindIntervalEvent() {
    if (document.visibilityState == "hidden") {
      this.removeInterval();
    } else if (document.visibilityState == "visible") {
      await this.initData();
    }
  },
  async mounted() {
    if (this.mode === "exchange") {
      this.startDate = new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .substr(0, 10);
    }
    await this.initData();
    document.addEventListener("visibilitychange", this.bindIntervalEvent);
  },
  beforeDestroy() {
    this.removeInterval();
    document.removeEventListener("visibilitychange", this.bindIntervalEvent);
  },
  methods: {
    removeInterval(){
      if (this.intervalRefresh) {
        clearInterval(this.intervalRefresh);
        this.intervalRefresh = null;
      }
    },
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
    delaySetLoading: function(time = 1000) {
      setTimeout(() => {
        this.isLoading = false;
      }, time);
    },
    async initData() {
      let times = 5,
        stop = false;
      while (times > 0 && !stop) {
        await this.$eventHandle(this.fetchOrderHistory, ["", true])
          .then(() => {
            stop = true;
            times = 0;
            this.$store.commit("exchange/SET_CONNECT_STATUS", {
              orderConnect: true
            });
          })
          .catch(e => {
            console.log("network error, requesting again");
            this.$store.commit("exchange/SET_CONNECT_STATUS", {
              orderConnect: false
            });
            times--;
            this.$eventHandle(this.fetchOrderHistory, ["", true]);
          });
      }
      if (times !== 0) {
        this.$store.commit("exchange/SET_CONNECT_STATUS", {
          orderConnect: false
        });
      }
    },
    onScroll(event) {
      if (!event.target.clientHeight) return;
      if (this.nextpage) return;
      console.log("scroll to end");
      // 提早一行loading
      if (
        event.target.scrollTop + event.target.clientHeight + 5 >=
        event.target.scrollHeight
      ) {
        this.loadNextPage();
      }
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
      const defaultDigits = this.isCustomPair(item.market.base, item.market.quote) ? 8 : 5;
      return this.getPairConfig(base, quote, "book", "last_price", defaultDigits);
    },
    digitsAmount: function(item) {
      const base =
        item && item.market
          ? this.coinName(item.market.base, this.coinMap)
          : this.baseCurrency;
      const quote =
        item && item.market
          ? this.coinName(item.market.quote, this.coinMap)
          : this.quoteCurrency;
      const defaultDigits = this.isCustomPair(item.market.base, item.market.quote) ? item.asset_digit_quote : 5;    
      return this.getPairConfig(base, quote, "book", "amount", defaultDigits);
    },
    digitsTotal: function() {
      const base =
        item && item.market
          ? this.coinName(item.market.base, this.coinMap)
          : this.baseCurrency;
      const quote =
        item && item.market
          ? this.coinName(item.market.quote, this.coinMap)
          : this.quoteCurrency;
      return this.getPairConfig(base, quote, "book", "total", 3);
    },
    calcFilterByDate(date) {
      let start, end;
      let reset = true;
      end = moment()
        .hour(23)
        .minute(59)
        .second(59)
        .utc()
        .format(this.dateXHRFormat);
      switch (date) {
        case "week":
          start = moment()
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            .subtract(7, "days")
            .format(this.dateXHRFormat);
          break;
        case "month":
          start = moment()
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            .subtract(1, "month")
            .format(this.dateXHRFormat);
          break;
        case "3 months":
          start = moment()
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            .subtract(3, "month")
            .format(this.dateXHRFormat);
          break;
        case "day":
          start = moment()
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            //.subtract(1, "days")
            .format(this.dateXHRFormat);
          break;
        default:
          start = moment(this.startDate)
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            .format(this.dateXHRFormat);
          end = moment(this.endDate)
            .hour(23)
            .minute(59)
            .second(59)
            .utc()
            .format(this.dateXHRFormat);
          reset = false;
          break;
      }
      // clone moment object
      let filter = {
        start: start,
        end: end,
        lastid: null
      };
      // 更新 startDate endDate
      if (reset) {
        this.startDate = moment(moment.utc(start).toDate()).format(
          this.datepickerFormat
        );
        this.endDate = moment(moment.utc(end).toDate()).format(
          this.datepickerFormat
        );
      }
      return filter;
    },
    loadNextPage() {
      if (this.loadAll) {
        console.log("load all");
        return;
      }
      console.log("loading next page");
      this.nextpage = true;
      this.currentFilter.lastid =
        this.rowsData && this.rowsData.length ? last(this.rowsData).id : null;
      if (this.currentFilter.lastid) {
        this.$eventHandle(this.loadOrderNextPage)
          .then()
          .catch(e => {});
      }
    },
    /**
     * @argument date string 可用值 '' | day | week | month | 3 months
     *
     * 传空为读取datepicker控件设置值
     * 不空，则取当前时间作为结束时间, 传参作为时间差计算开始时间
     *
     * 结果统一转为UTC传给接口
     */
    searchByDate(date) {
      this.rowsData = [];
      if (date) {
        let filter = Object.assign(
          {},
          this.currentFilter,
          this.calcFilterByDate(date)
        );
        this.currentFilter = Object.assign({}, filter);
      }
      this.$eventHandle(this.fetchOrderHistory, [date]);
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
        })
      );
    },
    async fetchOrderHistory(date, showLoading = false) {
      const func = async (d, show) => {
        if (!this.username) {
          this.isLoading = false;
          return;
        }
        this.loadAll = false;
        let filter;
        if (!this.currentFilter) {
          filter = Object.assign({}, this.filter, this.calcFilterByDate(d));
          this.currentFilter = Object.assign({}, filter);
        } else {
          filter = this.currentFilter;
        }
        // console.log(
        //   "fetchOrderHistory filter ",
        //   filter
        // );
        // closed orders
        if (show) {
          this.isLoading = true;
        }
        let closedRows = await this.cybexjs.getClosedOrder(
          this.username,
          filter.start,
          filter.end,
          this.limit,
          null,
          filter.base_id,
          filter.quote_id,
          filter.white_flag
        );
        if (showLoading) {
          this.isLoading = false;
        }
        await this.mapRowAssetDigits(closedRows);
        let diff = differenceWith(this.rowsData, closedRows, isEqual);
        if (diff.length > 1) {
          console.log("你有" + diff.length + "笔新的成交");
        }
        // console.log('closedRows', this.enableInterval, closedRows);
        this.rowsData = closedRows ? closedRows : [];
        this.$nextTick(() => {
          this.delaySetLoading();
        });
      };
      await func(date, showLoading);
      // 检查是否定期更新数据
      if (!this.intervalRefresh && this.enableInterval) {
        this.intervalRefresh = setInterval(async () => {
          // 只有最后时间为当天, 且没有翻页过的时候才读取数据
          if (!this.currentFilter) return;
          const filterEnd = moment(this.currentFilter.end).format("YYYY-MM-DD");
          const today = moment().format("YYYY-MM-DD");
          if (this.currentFilter.lastid === null && filterEnd == today) {
            await func();
          }
        }, this.refreshRate);
      }
      // console.log(">>>>>> Closed Orders", closedRows);
    },
    // Change filter, reload data
    async updateOrderHistory() {
      if (!this.username) return;
      this.isLoading = true;
      this.loadAll = false;
      this.rowsData = [];
      if (this.$refs.refEndMenu && this.endMenu) {
        this.$refs.refEndMenu.save(this.endDate);
      }
      if (this.$refs.refStartMenu && this.startMenu) {
        this.$refs.refStartMenu.save(this.startDate);
      }
      let filter = Object.assign({}, this.filter, this.calcFilterByDate());
      this.currentFilter = Object.assign({}, filter);
      console.log(
        "change order history filter>>>>",
        this.username,
        filter.start,
        filter.end,
        this.limit,
        null,
        filter.base_id,
        filter.quote_id,
        filter.white_flag
      );
      let closedRows = await this.cybexjs.getClosedOrder(
        this.username,
        filter.start,
        filter.end,
        this.limit,
        null,
        filter.base_id,
        filter.quote_id,
        filter.white_flag
      );
      await this.mapRowAssetDigits(closedRows);
      this.rowsData = closedRows ? closedRows : [];
      this.isLoading = false;
    },
    async loadOrderNextPage() {
      if (!this.username) return;
      this.isLoading = true;
      // console.log(
      //   "loading order next page",
      //   this.username,
      //   this.currentFilter.start,
      //   this.currentFilter.end,
      //   this.limit,
      //   this.currentFilter.lastid,
      //   this.currentFilter.base_id,
      //   this.currentFilter.quote_id,
      //   this.currentFilter.white_flag
      // );
      let closedRows = await this.cybexjs.getClosedOrder(
        this.username,
        this.currentFilter.start,
        this.currentFilter.end,
        this.limit,
        this.currentFilter.lastid,
        this.currentFilter.base_id,
        this.currentFilter.quote_id,
        this.currentFilter.white_flag
      );
      if (closedRows.length === 0) {
        this.loadAll = true;
      }
      await this.mapRowAssetDigits(closedRows);
      console.log("原来的数据", this.rowsData);
      console.log("下一页的数据", closedRows);
      this.rowsData = uniqBy(concat(this.rowsData, closedRows), "id");
      this.isLoading = false;
      this.nextpage = false;
    },
    resetSelectContent() {
      this.selectedPair = { base_id: "", quote_id: "" };
      this.startDate = new Date(this.limitDate).toISOString().substring(0, 10);
      this.endDate = new Date(this.today).toISOString().substring(0, 10);
    },
    querySelections(v) {
      this.loadingPair = true;
      // Simulated ajax query
      setTimeout(() => {
        this.itemsPair = this.statesPair.filter(e => {
          return (
            (e.text || "").toLowerCase().indexOf((v || "").toLowerCase()) > -1
          );
        });
        this.loadingPair = false;
      }, 100);
    }
  },
  mixins: [utils]
};
</script>