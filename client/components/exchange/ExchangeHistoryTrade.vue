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
          class="date-time mr-2"
          ref="startMenu"
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
          <cybex-text-field tiny no-message slot="activator" v-model="startDateFormatted" readonly/>
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
            <v-btn
              flat
              color="#78819A"
              @click="startMenu = false"
            >{{ $t('exchange.dialog.Cancel') }}</v-btn>
            <v-btn
              flat
              color="#78819A"
              @click="$refs.startMenu.save(startDate)"
            >{{ $t('exchange.dialog.OK') }}</v-btn>
          </v-date-picker>
        </v-menu>
        <!-- end date-->
        <v-menu
          ref="endMenu"
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
            v-model="endDateFormatted"
            solo
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
            scrollable
          >
            <v-spacer/>
            <v-btn flat color="#78819A" @click="endMenu = false">{{ $t('exchange.dialog.Cancel') }}</v-btn>
            <v-btn
              flat
              color="#78819A"
              @click="$refs.endMenu.save(endDate)"
            >{{ $t('exchange.dialog.OK') }}</v-btn>
          </v-date-picker>
        </v-menu>
        <v-btn ripple @click="updateTradeHistory()" icon>
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
          class="date-time"
          ref="startMenu"
          :close-on-content-click="false"
          v-model="startMenu"
          :nudge-bottom="12"
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
            v-model="startDateFormatted"
            solo
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
            scrollable
          >
            <v-spacer/>
            <v-btn
              flat
              color="#78819A"
              @click="startMenu = false"
            >{{ $t('exchange.dialog.Cancel') }}</v-btn>
            <v-btn
              flat
              color="#78819A"
              @click="$refs.startMenu.save(startDate)"
            >{{ $t('exchange.dialog.OK') }}</v-btn>
          </v-date-picker>
        </v-menu>
        <span class="ml-1 mr-1">-</span>
        <!-- end date-->
        <v-menu
          class="date-time"
          ref="endMenu"
          :close-on-content-click="false"
          v-model="endMenu"
          :nudge-bottom="12"
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
            v-model="endDateFormatted"
            solo
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
            scrollable
          >
            <v-spacer/>
            <v-btn flat color="#78819A" @click="endMenu = false">{{ $t('exchange.dialog.Cancel') }}</v-btn>
            <v-btn
              flat
              color="#78819A"
              @click="$refs.endMenu.save(endDate)"
            >{{ $t('exchange.dialog.OK') }}</v-btn>
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex>
        <v-layout row align-center>
          <CustomBaseQuoteSelector
            :size="'small'"
            v-if="whiteFlag == 'custom'"
            v-model="selectedPair"
          />
          <ContestBaseQuoteSelector v-else-if="whiteFlag == 'game'" v-model="selectedPair"/>
          <BaseQuoteSelector v-else-if="whiteFlag === 'white'" v-model="selectedPair"/>
          <v-flex>
            <cybex-btn
              :disabled="couldSearchHistory"
              tiny
              color="major"
              class="search mr-2 text-capitalize"
              @click="updateTradeHistory()"
            >{{ $t('exchange.content.search') }}</cybex-btn>
            <cybex-btn
              tiny
              color="minor"
              class="reset text-capitalize"
              @click="resetSelectContent()"
            >{{ $t('exchange.content.reset') }}</cybex-btn>
          </v-flex>
        </v-layout>
      </v-flex>
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
    <perfect-scrollbar ref="scrollEle" :options="{minScrollbarLength: 30, useBothWheelAxes: true}">
      <v-data-table
        ref="scrollTable"
        :headers="headers"
        :items="rowsData"
        hide-actions
        class="has_filter middle-size-table"
        :class="{'empty-table': !rowsData || rowsData.length == 0}"
      >
        <template slot="headerCell" slot-scope="props">{{ props.header.text }}</template>
        <template slot="items" slot-scope="props">
          <td class="text-xs-left col-date">{{ props.item.time | date('DD/MM HH:mm:ss') }}</td>
          <td class="text-xs-left">
            <asset-pairs
              :max-width="limitAssetSize ? '100px' : null"
              :max-quote-width="limitAssetSize ? '50px' : null"
              :quote-id="props.item.market.quote"
              :spacer="false"
              :base-id="props.item.market.base"
            />
          </td>
          <td
            class="text-xs-left text-uppercase"
            :class="{ 
              'c-buy': props.item.tradetype == 'buy',
              'c-sell': props.item.tradetype == 'sell'}"
          >{{ $t('exchange.content.' + props.item.tradetype.toLowerCase()) }}</td>
          <td
            class="text-xs-left"
          >{{ props.item.price | roundDigits(props.item.asset_digit_price) | shortenPrice }}</td>
          <td
            class="text-xs-left"
          >{{ props.item.quote_amount | roundDigits(props.item.asset_digit_amount) }}</td>
          <!-- 手续费精度 卖出看base币 买入看quote币-->
          <td class="text-xs-left keep-inline" v-if="props.item.tradetype == 'buy'">
            {{ props.item.fee.amount | roundDigits(props.item.asset_digit_quote, 0, '--') }}
            <asset-pairs
              v-if="props.item.fee.amount != 0"
              :max-width="limitAssetSize ? '50%' : null"
              :asset-id="props.item.fee.asset_id"
            />
          </td>
          <td class="text-xs-left keep-inline" v-else>
            {{ props.item.fee.amount | roundDigits(props.item.asset_digit_base, 0, '--') }}
            <asset-pairs
              v-if="props.item.fee.amount != 0"
              :max-width="limitAssetSize ? '50%' : null"
              :asset-id="props.item.fee.asset_id"
            />
          </td>
          <!-- 成交总金额 根据base币资产精度-->
          <td class="text-xs-right keep-inline">
            {{ props.item.base_amount | roundDigits(props.item.asset_digit_base) }}
            <asset-pairs
              :max-width="limitAssetSize ? '50%' : null"
              :asset-id="props.item.market.base"
            />
          </td>
        </template>
        <template slot="no-data">
          <Loading v-if="isLoading"/>
          <div class="no-data" v-else>{{ $t('exchange.order-table.no-trade-data') }}</div>
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
import PerfectScrollbar from "perfect-scrollbar";
import {
  isEqual,
  differenceWith,
  clone,
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
    CustomBaseQuoteSelector: () => import("~/components/CustomBaseQuoteSelector.vue"),
    ContestBaseQuoteSelector: () => import("~/components/ContestBaseQuoteSelector.vue"),
    Loading: () => import("~/components/exchange/ExchangeLoading.vue")
  },
  props: {
    mode: {
      type: String,
      default: "exchange"
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
      ps: null,
      intervalRefresh: null,
      rowsData: [],
      isLoading: this.username != "" && this.username != null,
      nextpage: false,
      bindPageEvent: false,
      dateDisplayFormat: "YYYY/MM/DD",
      dateXHRFormat: "YYYY-MM-DDTHH:mm:ss",
      datepickerFormat: "YYYY-MM-DD",
      startMenu: false,
      endMenu: false,
      limitDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        .toISOString()
        .substr(0, 10),
      today: new Date()
        .toISOString()
        .substr(0, 10),
      startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        .toISOString()
        .substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
      showFixedHeader: false,
      headers: [
        {
          text: this.$t("exchange.order-table.column.time"),
          align: "left",
          sortable: false,
          value: "time",
          width: "104px"
        },
        {
          text: this.$t("exchange.order-table.column.pair"),
          align: "left",
          sortable: false,
          value: "market",
        },
        {
          text: this.$t("exchange.order-table.column.side"),
          align: "left",
          sortable: false,
          value: "tradetype",
          width: "42px"
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
          value: "quote_amount"
        },
        {
          text: this.$t("exchange.order-table.column.fee"),
          align: "left",
          sortable: false,
          value: "fee"
        },
        {
          text: this.$t("exchange.order-table.column.total"),
          align: "right",
          sortable: false,
          value: "base_amount"
        }
      ],
      // 搜索框
      selectedPair: { base_id: "", quote_id: "" },
      currentFilter: null,
      loadAll: false,
      page: 0,
      limit: 10
    };
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
                "ps-y-reach-end",
                this.onScroll
              );
            }
          }
        });
      } else {
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
          this.$refs.scrollEle.$el.removeEventListener("ps-scroll-y", this.onFixedHeader);
          this.$nextTick(() => {
            this.$refs.scrollEle.$el.scrollTop = 0;
          });
        }
      }
    },
    searchPair(val) {
      val && val !== this.selectPair && this.querySelections(val);
    },
    orderFilter: async function(v) {
      this.rowsData = [];
      this.page = 0;
      if (!this.currentFilter) {
        this.currentFilter = v;
      } else {
        Object.assign(this.currentFilter, {
          base_id: v ? v.base_id : null,
          quote_id: v ? v.quote_id : null
        });
      }
      await this.$eventHandle(this.fetchTradeHistory, ["", true]);
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
    async initData() {
      let times = 3,
        stop = false;
      while (times > 0 && !stop) {
        await this.$eventHandle(this.fetchTradeHistory, ["", true])
          .then(() => {
            times = 0;
            stop = true;
            this.$store.commit("exchange/SET_CONNECT_STATUS", {
              tradeConnect: true
            });
          })
          .catch(e => {
            console.log("network error, requesting again");
            this.$store.commit("exchange/SET_CONNECT_STATUS", {
              tradeConnect: false
            });
            times--;
            this.$eventHandle(this.fetchTradeHistory, ["", true]);
          });
        if (times !== 0) {
          this.$store.commit("exchange/SET_CONNECT_STATUS", {
            tradeConnect: false
          });
        }
      }
    },
    delaySetLoading: function(time = 1000) {
      setTimeout(() => {
        this.isLoading = false;
      }, time);
    },
    async mapRowAssetDigits(rows) {
      // 增加资产精度
      await Promise.all(
        map(rows, async (item, idx) => {
          const k = "asset-" + item.market.base;
          const k2 = "asset-" + item.market.quote;
          if (!this.staticDigits[k]) {
            const r = await this.cybexjs.queryAsset(item.market.base);
            this.staticDigits[k] = r.precision;
          }
          if (!this.staticDigits[k2]) {
            const r = await this.cybexjs.queryAsset(item.market.quote);
            this.staticDigits[k2] = r.precision;
          }
          // base quote的默认资产精度
          // 根据买卖方向选择不同 
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
    onScroll(event) {
      if (!event.target.clientHeight) return;
      if (this.nextpage) return;
      // this.offsetTop = e.target.scrollTop;
      // 提早一行loading
      if (
        event.target.scrollTop + event.target.clientHeight + 5 >=
        event.target.scrollHeight
      ) {
        this.loadNextPage();
      }
    },
    async loadNextPage() {
      if (this.loadAll) {
        console.log("load all");
        return;
      }
      // console.log("loading next trade page");
      await this.loadTradeNextPage();
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
      this.page = 0;
      if (date) {
        let filter = Object.assign(
          {},
          this.currentFilter,
          this.calcFilterByDate(date)
        );
        this.currentFilter = Object.assign({}, filter);
      }
      this.fetchTradeHistory(date, true);
    },
    /**
     * @argument date string 可用值 '' | day | week | month | 3 months
     *
     * 传空为读取datepicker控件设置值
     * 不空，则取当前时间作为结束时间, 传参作为时间差计算开始时间
     *
     * 结果统一转为UTC传给接口
     */
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
        end: end
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
    async loadTradeNextPage() {
      if (!this.username) return;
      this.isLoading = true;
      this.nextpage = true;
      this.page += 1;
      console.log(
        "loading trade next page",
        this.username,
        this.currentFilter.start,
        this.currentFilter.end,
        this.page,
        this.limit,
        this.currentFilter.base_id,
        this.currentFilter.quote_id,
        this.currentFilter.white_flag
      );
      let tradeRows = await this.cybexjs.fillorder_history(
        this.username,
        this.currentFilter.start,
        this.currentFilter.end,
        clone(this.page),
        this.limit,
        this.currentFilter.base_id,
        this.currentFilter.quote_id,
        this.currentFilter.white_flag
      );
      if (tradeRows.length === 0) {
        this.loadAll = true;
      }
      this.mapRowAssetDigits(tradeRows);
      console.log("原来的数据", this.rowsData);
      console.log("下一页的数据", tradeRows, this.page);
      this.rowsData = concat(this.rowsData, tradeRows);
      this.delaySetLoading(0);
      this.nextpage = false;
    },
    // 初次获取 trade order 数据
    async fetchTradeHistory(date, showLoading = false) {
      const func = async (d, show) => {
        this.loadAll = false;
        this.page = 0;
        if (!this.username) {
          this.delaySetLoading(0);
          return;
        }
        let filter;
        if (!this.currentFilter) {
          filter = Object.assign({}, this.filter, this.calcFilterByDate(d));
          // 第一次请求, 减少交易所页面请求压力，不传start end
          if (this.mode === "exchange") {
            filter.start = null;
            filter.end = null;
          }
          this.currentFilter = Object.assign({}, filter);
        } else {
          filter = this.currentFilter;
        }
        // trade history
        if (show) {
          this.isLoading = true;
        }
        // console.log('fetch trade history', this.username,
        //   filter.start,
        //   filter.end,
        //   this.page,
        //   this.limit,
        //   filter.base_id,
        //   filter.quote_id,
        //   filter.white_flag)
        let tradeRows = await this.cybexjs.fillorder_history(
          this.username,
          filter.start,
          filter.end,
          this.page,
          this.limit,
          filter.base_id,
          filter.quote_id,
          filter.white_flag
        );
         // 预处理精度
        await this.mapRowAssetDigits(tradeRows);
        // console.log(tradeRows);
        if (this.rowsData.length) {
          let diff = differenceWith(this.rowsData, tradeRows, isEqual);
          if (diff.length > 1) {
            console.log("你有" + diff.length + "笔新的委托记录");
          }
        }
        this.rowsData = tradeRows ? tradeRows : [];
        this.$nextTick(() => {
          this.delaySetLoading();
        });
      };
      await func(date, showLoading);
      // 检查是否定期更新数据
      if (!this.intervalRefresh && this.mode == "exchange") {
        this.intervalRefresh = setInterval(async () => {
          // 只有最后时间为当天, 且没有翻页过的时候才读取数据
          if (!this.currentFilter) return;
          const filterEnd = moment(this.currentFilter.end).format("YYYY-MM-DD");
          const today = moment().format("YYYY-MM-DD");
          if (
            this.page == 0 &&
            (this.currentFilter.end === null || filterEnd == today)
          ) {
            await func(date, false);
          }
        }, this.refreshRate);
      }
    },
    // 根据搜索条件，更新 trade history 列表
    async updateTradeHistory() {
      if (!this.username) return;
      // 如果日历控件为打开状态，保存最新值
      if (this.$refs.endMenu && this.endMenu) {
        this.$refs.endMenu.save(this.endDate);
      }
      if (this.$refs.startMenu && this.startMenu) {
        this.$refs.startMenu.save(this.startDate);
      }
      this.loadAll = false;
      this.rowsData = [];
      this.page = 0;
      let filter = Object.assign({}, this.filter, this.calcFilterByDate());
      this.currentFilter = Object.assign({}, filter);
      this.isLoading = true;
      console.log(
        "updateTradeHistory filter",
        this.username,
        filter.start,
        filter.end,
        0,
        this.limit,
        filter.base_id,
        filter.quote_id,
        filter.white_flag
      );
      let tradeRows = await this.cybexjs.fillorder_history(
        this.username,
        filter.start,
        filter.end,
        0,
        this.limit,
        filter.base_id,
        filter.quote_id,
        filter.white_flag
      );
      this.mapRowAssetDigits(tradeRows);
      this.rowsData = tradeRows ? tradeRows : [];
      this.delaySetLoading();
      // console.log(">>>>>> Trade history",this.page, tradeRows);
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
    },
    removeInterval(){
      if (this.intervalRefresh) {
        clearInterval(this.intervalRefresh);
        this.intervalRefresh = null;
      }
    },
    async bindIntervalEvent() {
      if (document.visibilityState == "hidden") {
        this.removeInterval();
      } else if (document.visibilityState == "visible") {
        await this.initData();
      }
    }
  },
  computed: {
    ...mapGetters({
      bases: "user/bases",
      coinMap: "user/coins",
      coinsInvert: "user/coinsInvert",
      username: "auth/username",
      baseCurrency: "exchange/base",
      asset_is_custom: "exchange/asset_is_custom",
      quoteCurrency: "exchange/quote",
      quote_is_custom: "exchange/quote_is_custom",
      refreshRate: "exchange/tradesRefreshRate",
      innerWidth: "exchange/innerWidth"
    }),
    limitAssetSize(){
      return this.mode == 'exchange' && this.innerWidth <= 1440;
    },
    couldSearchHistory(){
      if (this.whiteFlag !== 'custom') return false;
      const selectHasValue = this.selectedPair && (this.selectedPair.base_id && this.selectedPair.quote_id) || (this.selectedPair.base_id == '' && this.selectedPair.quote_id == '')
      return selectHasValue ? false : true;
    },
    endDateFormatted: function() {
      return moment(this.endDate).format(this.dateDisplayFormat);
    },
    startDateFormatted: function() {
      return moment(this.startDate).format(this.dateDisplayFormat);
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
    if (this.intervalRefresh) {
      clearInterval(this.intervalRefresh);
    }
    document.removeEventListener("visibilitychange", this.bindIntervalEvent);
  },
  mixins: [utils]
};
</script>

<style scoped>
</style>