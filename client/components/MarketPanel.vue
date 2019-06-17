<template>
  <v-menu
    offset-y
    :max-width="maxWidth"
    :min-width="minWidth"
    v-model="showMarket"
    :open-on-click="false"
    :close-on-content-click="false"
  >
    <!-- 交易对名字显示开始 -->
    <v-flex
      :grow="1"
      :shrink="1"
      d-flex
      align-center
      class="control-item favorite"
      slot="activator"
    >
      <template v-if="inited">
        <!-- 预加载ic-star_active防止初次读取卡顿 -->
        <v-icon style="display:none" class="hidden" v-text="'ic-star_active'"/>
        <v-btn v-if="asset_is_custom === false" @click="onBookmark($event, quote_id, base_id)" icon>
          <v-icon class="marked-icon">{{ isMarked ? 'ic-star_active' : 'ic-star' }}</v-icon>
        </v-btn>
        <span class="current-pairs mt-1" @click="showPanelHandler">
          <asset-pairs
            :max-width="limitAssetSize ? '180px' : null"
            :max-quote-width="limitAssetSize ? '70%' : null"
            :base-id="baseCurrency"
            :quote-id="quoteCurrency"
          />
        </span>
        <v-icon
          class="arrow-icon ml-2"
          style="display: inline"
          @click="showPanelHandler"
        >{{ showMarket ? 'ic-arrow_up' : 'ic-arrow_drop_down' }}</v-icon>
      </template>
    </v-flex>
    <!-- 交易对名字显示结束 -->
    <!-- 下拉菜单内容开始 -->
    <div class="market-panel">
      <!-- 自定义 / 固定资产切换tab -->
      <v-flex class="tab-title-wrapper">
        <span
          @click="(currentMarketTab = 'market')"
          class="tab-title"
          :class="{'active': currentMarketTab == 'market'}"
        >{{ $t('tab_label.mainlist') }}</span>
        <span
          @click="(currentMarketTab = 'others')"
          class="tab-title"
          :class="{'active': currentMarketTab == 'others'}"
        >{{ $t('tab_label.otherslist') }}</span>
      </v-flex>
      <!-- 固定资产tab内容开始 -->
      <!-- 此处有bug tabs在menu中 slider线看不到 @see https://github.com/vuetifyjs/vuetify/issues/1978 -->
      <v-tabs
        v-model="activeBase"
        dark
        slider-color="cybex"
        :class="{'hidden': currentMarketTab != 'market'}"
      >
        <v-tab v-for="(item, index) in tabItems" :key="index" ripple @click="onBaseChanged(index)">
          <asset-pairs v-if="item && item.asset_id" :asset-id="item.asset_id"/>
          <template v-else>
            <!-- 中英文调整行高 -->
            <span v-if="locale !== 'en'" class="pb-1 pt-0">
              <v-icon v-if="!onBookmarkTab" class="small" :class="{'mb-1': locale == 'en'}">ic-star</v-icon>
              <v-icon v-else class="small" :class="{'mb-1': locale == 'en'}">ic-star_active</v-icon>
              {{ $t('tab_label.subscribed') }}
            </span>
            <template v-else>
              <v-icon v-if="!onBookmarkTab" class="small mb-1">ic-star</v-icon>
              <v-icon v-else class="small mb-1">ic-star_active</v-icon>
              {{ $t('tab_label.subscribed') }}
            </template>
          </template>
        </v-tab>
        <v-tab-item class="content-tab" v-for="(item, idx) in tabItems" :key="idx" align-center>
          <cybex-text-field
            v-model="querystr"
            prepend-inner-icon="ic-search"
            small
            clearable
            no-message
            :placeholder="$t('placeholder.market_filter')"
          />
          <div class="table-wrapper mt-2">
            <cybex-data-table
              class="middle-size-table"
              :class="{'empty-table': marketDatas.length === 0}"
              :headers="marketHeaders"
              :items="marketDatas"
              :is-fixed-header-table="true"
              hide-actions
              :sort-icon="'ic-arrow_up'"
              :must-sort="true"
              :custom-sort="sorkMarketData"
              :pagination.sync="pagination"
            >
              <template slot="items" slot-scope="props">
                <tr
                  :class="props.item.quote===quote_id&&props.item.base===base_id ? 'current-row' : 'select-row'"
                  @click="onPairSelected($event, props.item)"
                >
                  <!-- bookmark + name-->
                  <td class="text-xs-left">
                    <v-flex d-flex align-end just-space-around class="col-bookmark">
                      <v-icon
                        size="16"
                        class="mr-2 marked-icon"
                        @click="onBookmark($event, props.item.quote, props.item.base)"
                      >{{ markedQuote[`${props.item.quote}_${props.item.base}`] ? 'ic-star_active small' : 'ic-star' }}</v-icon>
                      <v-flex v-if="idx==baseList.length" d-flex :grow="0" align-end>
                        <asset-pairs :base-id="props.item.base" :quote-id="props.item.quote"/>
                      </v-flex>
                      <v-flex d-flex :grow="0" align-end v-else>
                        <asset-pairs :asset-id="props.item.quotename"/>
                      </v-flex>
                    </v-flex>
                  </td>
                  <!-- volume -->
                  <td
                    class="text-xs-right"
                  >{{ props.item.base_volume | shortenVolume(props.item.asset_digits_volume) }}</td>
                  <!-- price -->
                  <td
                    class="text-xs-right"
                  >{{ parseFloat(props.item.latest) | roundDigits(props.item.asset_digits_price) }}</td>
                  <!-- change -->
                  <td class="text-xs-right col-change">
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
              <template slot="no-data">
                <h4 class="text-center">{{ $t('info.no_available_pair') }}</h4>
              </template>
            </cybex-data-table>
          </div>
        </v-tab-item>
      </v-tabs>
      <!-- 固定资产tab内容结束 -->
      <!-- 用户发行资产开始 -->
      <v-flex class="content-tab" :class="{'hidden': currentMarketTab != 'others'}">
        <cybex-btn class="add-custom-icon" normal icon @click="(showAddCustomMarket = true)">
          <v-icon>ic-add</v-icon>
        </cybex-btn>
        <cybex-text-field
          v-model="querystr"
          prepend-inner-icon="ic-search"
          small
          clearable
          no-message
          :placeholder="$t('placeholder.market_filter')"
        />
        <div class="table-wrapper no-tab mt-2">
          <cybex-data-table
            class="middle-size-table"
            :class="{'empty-table': customMarketData.length === 0}"
            :headers="customMarketHeaders"
            :is-fixed-header-table="true"
            :sort-icon="'ic-arrow_up'"
            :items="customMarketData"
            hide-actions
            :must-sort="true"
            :custom-sort="sorkMarketData"
            :pagination.sync="pagination"
          >
            <template slot="no-data">
              <v-flex
                d-flex
                justify-space-around
                align-center
                class="ma-5 text-center"
              >{{ $t('info.no_available_pair') }}</v-flex>
            </template>
            <template slot="items" slot-scope="props">
              <tr
                :class="props.item.quote === quote_id && props.item.base === base_id ? 'current-row' : 'select-row'"
                @click="onPairSelected($event, props.item)"
              >
                <!-- remove line icon -->
                <td class="pa-0 ma-0">
                  <v-icon
                    class="remove-custom-icon action"
                    @click="removeCustomAssetPair($event, props.item)"
                    size="14"
                  >ic-add_box_active_disabled</v-icon>
                </td>
                <!-- asset pairs name-->
                <td class="text-xs-left">
                  <v-flex d-flex align-end just-space-around shrink>
                    <asset-pairs
                      class="col-custom-name"
                      :max-quote-width="'60%'"
                      :base-id="props.item.basename"
                      :quote-id="props.item.quotename"
                    />
                  </v-flex>
                </td>
                <!-- volume -->
                <td
                  class="text-xs-right"
                >{{ props.item.base_volume | shortenVolume(props.item.asset_digits_volume) }}</td>
                <!-- price -->
                <td
                  class="text-xs-right"
                >{{ props.item.latest | roundDigits(props.item.asset_digits_price) | shortenPrice }}</td>
                <!-- change -->
                <td class="text-xs-right col-change">
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
          </cybex-data-table>
        </div>
        <!-- 添加自定义交易对面板开始 -->
        <v-flex class="add-markets-wrapper" :class="{'hidden': !showAddCustomMarket}">
          <div class="pb-4">
            <cybex-btn class="mr-2" normal icon @click="(showAddCustomMarket = false)">
              <v-icon>ic-arrow-back</v-icon>
            </cybex-btn>
            <span class="tab-title active pt-2">{{ $t('custom.add-markets') }}</span>
          </div>
          <!-- 下拉框开始 -->
          <CustomBaseQuoteSelector
            :exclude-rule="excludeRule"
            :max-width="maxWidth"
            v-model="selectedCustomPair"
            @search-end="searchCustomAssetEnd($event)"
          />
          <!-- 描述开始 -->
          <v-flex d-flex class="add-markets-desc">
            <v-icon>ic-grey-feedback</v-icon>
            <span class="pl-1">
              <div v-html="$t('custom.add-desc')"/>
            </span>
            <v-flex v-if="isCustomAssetPairExist" class="add-markets-error c-error">
              <v-icon class="mr-2" size="16">ic-error</v-icon>
              <span>{{ $t('custom.added-existed-error') }}</span>
            </v-flex>
            <v-flex v-else-if="isAssetInWhitelist" class="add-markets-error c-error">
              <v-icon class="mr-2" size="16">ic-error</v-icon>
              <span>{{ $t('custom.added-error') }}</span>
            </v-flex>
          </v-flex>
          <div class="add-market-btn">
            <cybex-btn
              :disabled="!couldAddCustomAssetPair"
              small
              @click="addCustomAssetPair"
            >{{ $t('custom.add-btn') }}</cybex-btn>
          </div>
        </v-flex>
      </v-flex>
    </div>
  </v-menu>
</template>
<script>
import { mapGetters } from "vuex";
import utils from "~/components/mixins/utils";
import {
  mergeWith,
  indexOf,
  clone,
  filter,
  has,
  sum,
  keys,
  values,
  map,
  orderBy
} from "lodash";
import PerfectScrollbar from "perfect-scrollbar";
import CustomBaseQuoteSelector from "~/components/CustomBaseQuoteSelector.vue";
import CybexDataTable from "~/components/theme/CybexDataTable.vue";
let loopFlag;

export default {
  mixins: [utils],
  components: {
    CustomBaseQuoteSelector,
    CybexDataTable
  },
  data() {
    return {
      maxWidth: 394,
      minWidth: 364,
      intervalCustomData: null,
      maxCustomAsset: 20, // 最多允许自定义20条
      currentMarketTab: "market", // 默认打开market tab 'market' | 'others'
      selectedCustomPair: {
        base: null,
        quote: null
      },
      showAddCustomMarket: false, // 是否显示添加tab
      showMarket: false,
      querystr: "",
      items: [],
      isLoading: false,
      search: null,
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
          // style: "width: 60px;",
          class: ["text-right", "pr-0"]
        },
        {
          text: this.$t("table_title.price"),
          value: "latest",
          sortable: false,
          align: "right"
          // style: "width: 120px;"
        },
        {
          text: this.$t("table_title.change"),
          value: "percent_change",
          sortable: false,
          align: "right"
          // style: "width: 100px;"
        }
      ],
      customMarketHeaders: [
        {
          text: "",
          sortable: false,
          align: "left",
          width: "16px"
        },
        {
          text: this.$t("table_title.coin"),
          value: "quotename",
          sortable: false,
          align: "left",
          width: "120px"
        },
        {
          text: this.$t("table_title.volume"),
          value: "basevol",
          sortable: true,
          descending: true,
          align: "left",
          // style: "width: 60px;",
          class: ["text-right", "pr-0"]
        },
        {
          text: this.$t("table_title.price"),
          value: "latest",
          sortable: false,
          align: "right"
          // style: "width: 120px;"
        },
        {
          text: this.$t("table_title.change"),
          value: "percent_change",
          sortable: false,
          align: "right"
          // style: "width: 100px;"
        }
      ],
      datas: [],
      customData: [],
      precisions: null,
      scrollhash: [],
      activeBase: null,
      inited: false,
      topPairs: []
    };
  },
  filters: {
    headClass(index, headers) {
      return {
        "header-first": index === 0,
        "header-last": index === headers.length - 1,
        "header-normal": index > 0 && index < headers.length - 1,
        "volume-col": headers[index].value === "basevol"
      };
    }
  },
  computed: {
    ...mapGetters({
      locale: "i18n/locale",
      bases: "user/bases",
      coinMapInvert: "user/coinsInvert",
      coinMap: "user/coins",
      markedQuote: "bookmark/basequote",
      tradesRefreshRate: "exchange/tradesRefreshRate",
      baseCurrency: "exchange/base",
      quoteCurrency: "exchange/quote",
      base_id: "exchange/base_id",
      asset_is_custom: "exchange/asset_is_custom",
      quote_id: "exchange/quote_id",
      quote_is_custom: "exchange/quote_is_custom",
      priceDigits: "exchange/priceDigits",
      username: "auth/username",
      gamePrefix: "exchange/game_prefix",
      addedCustomPair: "bookmark/customPair" // 已添加交易对
    }),
    excludeRule() {
      return new RegExp(`^${this.gamePrefix}`);
    },
    limitAssetSize() {
      return this.mode == "exchange" && this.innerWidth <= 1440;
    },
    innerWidth() {
      return window ? window.innerWidth : 0;
    },
    customAssetQuote() {
      return this.selectedCustomPair.quote_id;
    },
    customAssetBase() {
      return this.selectedCustomPair.base_id;
    },
    onBookmarkTab() {
      return this.activeBase === this.baseList.length;
    },
    isMarked() {
      let ismarked = false;
      if (this.coinMapInvert) {
        const base_id = this.coinMapInvert[this.baseCurrency];
        const quote_id = this.coinMapInvert[this.quoteCurrency];
        ismarked = this.markedQuote[`${quote_id}_${base_id}`];
      }
      return ismarked;
    },
    tabItems() {
      let r = [];
      const basekeys = keys(this.bases);
      for (let id of basekeys) {
        r.push({
          asset_id: id
        });
      }
      r.push({});
      return r;
    },
    baseList() {
      const basekeys = keys(this.bases);
      return basekeys;
    },
    curBase() {
      return this.baseList[this.activeBase];
    },
    // 所有收藏的交易对
    bookedItems() {
      return filter(keys(this.markedQuote), item => {
        // 收藏交易对是当前配置交易对的子集
        const [quote, base] = item.split("_");
        const isPairActive =
          !!this.bases[base] && this.bases[base].data.indexOf(quote) > -1;
        return isPairActive && this.markedQuote[item];
      });
    },
    // 经过排序、过滤后的交易对数据
    marketDatas() {
      const curBase = this.curBase;
      const datas = this.datas[this.activeBase] || [];
      const filtered = this.querystr
        ? filter(datas, item => {
            // 收藏tab下quote、base都做匹配
            const isQuote =
              item.quotename.indexOf(this.querystr.toUpperCase()) > -1;
            return curBase
              ? isQuote
              : isQuote ||
                  this.coinName(item.base, this.coinMap).indexOf(
                    this.querystr.toUpperCase()
                  ) > -1;
          })
        : datas;
      // 精度
      filtered.map(item => {
         // 精度
        const price = this.getPairConfig(
          this.coinName(item.base, this.coinMap),
          this.coinName(item.quote, this.coinMap),
          "choose",
          "last_price",
          6
        );
        const volume = this.getPairConfig(
          this.coinName(item.base, this.coinMap),
          this.coinName(item.quote, this.coinMap),
          "choose",
          "volume",
          2
        );
        item["asset_digits_price"] = price;
        item["asset_digits_volume"] = volume;
        return item;
      });
      // sort first
      const ordered = this.sorkMarketData(filtered, 0, true);
      return ordered;
    },
    // 展示用custom market data
    customMarketData() {
      const filtered = this.querystr
        ? filter(this.customData, item => {
            return (
              item.quotename.indexOf(this.querystr.toUpperCase()) > -1 ||
              item.basename.indexOf(this.querystr.toUpperCase()) > -1
            );
          })
        : this.customData;
      return filtered;
    },
    routeLeaved() {
      return this.$route.path.indexOf("exchange") === -1;
    },
    // base quote是否都选中
    isCustomAssetPairHasValue() {
      return this.customAssetBase !== null &&
        this.customAssetQuote !== null &&
        this.customAssetBase &&
        this.customAssetQuote
        ? true
        : false;
    },
    // base quote是否是官方交易对
    isAssetInWhitelist() {
      let check = false;
      const base = this.customAssetBase;
      const quote = this.customAssetQuote;
      if (this.isCustomAssetPairHasValue) {
        // 已存在官方交易对
        if (this.bases[base]) {
          const result = indexOf(this.bases[base].data, quote);
          check = result > -1;
        }
        if (!check && this.bases[quote]) {
          const result = indexOf(this.bases[quote].data, base);
          check = result > -1;
        }
      }
      return check;
    },
    // 或者存在已添加列表
    isCustomAssetPairExist() {
      let c2 = false;
      const base = this.customAssetBase;
      const quote = this.customAssetQuote;
      // 检查是否已添加
      if (this.isCustomAssetPairHasValue) {
        c2 = has(this.addedCustomPair, `${quote}_${base}`);
        if (!c2) {
          c2 = has(this.addedCustomPair, `${base}_${quote}`);
        }
      }
      return c2;
    },
    couldAddCustomAssetPair() {
      return (
        this.isCustomAssetPairHasValue &&
        !this.isCustomAssetPairExist &&
        !this.isAssetInWhitelist
      );
    }
  },
  methods: {
    searchModelChange([type, val]) {
      if (type == "base") {
        this.customAssetBase = val;
      }
      if (type == "quote") {
        this.customAssetQuote = val;
      }
    },
    searchCustomAssetEnd(type) {
      this.resetScrollbar(`.asset-dropdown.ps-dropdown-${type} .v-select-list`);
    },
    // 确认删除自定义交易对
    async removeCustomAssetPair(event, item) {
      event.stopPropagation();
      event.preventDefault();
      const key = `${item.quote}_${item.base}`;
      this.$store.commit("bookmark/PUT_CUSTOM_PAIR", {
        username: this.username,
        key
      });
      await this.loadCustomAssetsData();
    },
    // 确认添加自定义交易对
    async addCustomAssetPair() {
      if (this.couldAddCustomAssetPair) {
        // 检查大小
        let check = await this.cybexjs.findBase(
          this.customAssetQuote,
          this.customAssetBase
        );
        let key = `${this.customAssetQuote}_${this.customAssetBase}`;
        if (this.customAssetBase !== check) {
          key = `${this.customAssetBase}_${this.customAssetQuote}`;
        }
        this.$store.commit("bookmark/PUT_CUSTOM_PAIR", {
          username: this.username,
          key
        });
        // reset data
        this.showAddCustomMarket = false;
        this.selectedCustomPair = {
          base: null,
          quote: null
        };
        // refresh
        await this.loadCustomAssetsData();
      }
    },
    showPanelHandler() {
      this.showMarket = !this.showMarket;
    },
    resetScrollbar(key) {
      if (this.scrollhash[key]) {
        this.scrollhash[key].update();
      } else {
        this.scrollhash[key] = new PerfectScrollbar(key);
        this.$nextTick(() => {
          this.scrollhash[key].update();
        });
      }
    },
    async onPairSelected($event, item) {
      if (item.quotename === this.quote_id && item.base === this.base_id) {
        $event.stopPropagation();
        return;
      }
      this.showMarket = false;
      if (!item.basename) {
        const tmp = await this.cybexjs.queryAsset(item.base);
        item.basename = tmp.symbol;
      }
      console.log(`redirect to /exchange/${item.quotename}_${item.basename}`);
      this.$i18n.jumpTo(`/exchange/${item.quotename}_${item.basename}`);
    },
    onBaseChanged(value) {
      this.activeBase = value;
    },
    // 刷新收藏的交易对
    async refreshBooked() {
      try {
        let a1 = this.bookedItems.map(async pair => {
          const [quote, base] = pair.split("_");
          return await this.$call(this.cybexjs.ticker, base, quote);
        });
        let s1 = await Promise.all(a1);
        this.$call(this.cybexjs.sortPair, s1);
        this.$set(this.datas, this.baseList.length, s1);
      } catch (e) {
        console.error(e);
      }
    },
    async refreshDatas() {
      if (!this.showMarket) return;
      if (this.routeLeaved) {
        clearInterval(loopFlag);
        loopFlag = null;
        return;
      }
      if (this.activeBase === this.baseList.length) {
        await this.refreshBooked();
      } else if (this.curBase) {
        try {
          const s = await this.$callmsg(this.cybexjs.loadbase, this.curBase);
          this.$set(this.datas, this.activeBase, s);
        } catch (e) {}
      }
    },
    // 先载入所有交易对行情，存下精度
    async loadAllBases() {
      let items = [];
      // 置顶交易对
      this.topPairs = await this.$callmsg(this.cybexjs.top_pairs);
      items[this.baseList.length] = [];
      // let precisions = {};
      const promises = map(this.baseList, async (item, index) => {
        const s = await this.$callmsg(this.cybexjs.loadbase, item);
        items[index] = s;
        items[this.baseList.length] = items[this.baseList.length].concat(
          filter(
            s,
            item => this.bookedItems.indexOf(`${item.quote}_${item.base}`) > -1
          )
        );
      });
      const results = await Promise.all(promises);
      this.datas = items;

      this.$nextTick(() => {
        this.inited = true;
      });
    },
    async loadCustomAssetsData() {
      if (this.currentMarketTab !== "others" || !this.showMarket) {
        return;
      }
      let customPairArr = filter(keys(this.addedCustomPair), item => {
        return this.addedCustomPair[item];
      });
      if (!customPairArr) {
        customPairArr = [];
      }
      let promises = [];
      await customPairArr.map(async (pair, idx) => {
        let [quote, base] = pair.split("_");
        let check = await this.cybexjs.findBase(quote, base);
        if (check != base) {
          customPairArr[idx] = `${base}_${quote}`;
          const tmp = base;
          base = quote;
          quote = tmp;
        }
        // 请求数据
        promises.push(
          this.$eventHandle(
            async (quote_id, base_id) => {
              return await this.cybexjs.ticker(base_id, quote_id);
            },
            [quote, base]
          )
        );
      });
      return Promise.all(promises)
        .then(async res => {
          if (res && res.length) {
            for (const i in res) {
              const baseInfo = await this.cybexjs.queryAsset(res[i].base);
              const quoteInfo = await this.cybexjs.queryAsset(res[i].quote);
              // 精度
              res[i]["basename"] = baseInfo.symbol;
              res[i]["quotename"] = quoteInfo.symbol;
              res[i]["asset_digits_volume"] = quoteInfo.precision;
              res[i]["asset_digits_price"] = 8;
            }
            this.customData = res;
          } else {
            this.customData = [];
          }
        })
        .catch(e => {
          console.error(e);
          this.customData = [];
        });
    },
    /**
     * 自定义排序
     * 置顶部分数据
     * @params items: object[], index: number, isDescending: boolean
     */
    sorkMarketData(items, index, isDescending) {
      // 置顶交易对
      const topItems = (this.topPairs || []).find(i => i.base === this.curBase);
      map(items, i => {
        const max = 9999;
        const topIndex = topItems ? topItems.quotes.indexOf(i.quote) : -1;
        i.basevol = parseFloat(i.base_volume);
        i.sortBase1 = topIndex > -1 ? 1 : 0;
        // 成交量排序，但置顶交易对只按配置顺序排
        i.sortBase2 =
          i.sortBase1 === 1 // 置顶交易对
            ? isDescending
              ? max - topIndex
              : topIndex
            : i.basevol;
      });
      const ordered = orderBy(
        items,
        ["sortBase1", "sortBase2"],
        ["desc", isDescending ? "desc" : "asc"]
      );
      return ordered;
    },
    async onBookmark(event, quote, base) {
      event.stopPropagation();
      event.preventDefault();
      const key = `${quote}_${base}`;
      this.$store.commit("bookmark/PUT_BOOKMARK", {
        username: this.username,
        key
      });
      await this.refreshBooked();
    }
  },
  watch: {
    async activeBase(val) {
      await this.refreshDatas();
    },
    search(val) {
      if (this.items.length > 0) return;
      if (this.isLoading) return;
      this.isLoading = true;
      // remote search
    },
    showMarket(value) {
      if (!value) {
        this.showAddCustomMarket = false;
      } else {
        if (this.asset_is_custom) {
          this.currentMarketTab = "others";
        } else {
          this.activeBase = this.baseList.indexOf(this.base_id);
          this.refreshDatas();
        }
      }
    },
    // 切换自定义 / 交易行情tab
    async currentMarketTab(value) {
      if (value == "others") {
        await this.loadCustomAssetsData();
        clearInterval(loopFlag);
        loopFlag = null;
        if (!this.intervalCustomData) {
          this.intervalCustomData = setInterval(async () => {
            await this.loadCustomAssetsData();
          }, this.tradesRefreshRate);
        }
      } else {
        loopFlag = setInterval(this.refreshDatas, this.tradesRefreshRate);
        this.activeBase = this.baseList.indexOf(this.base_id);
        await this.refreshDatas();
        clearInterval(this.intervalCustomData);
        this.intervalCustomData = null;
      }
    },
    async username() {
      this.$store.commit("bookmark/LOAD_BOOKMARK", this.username);
      this.$store.commit("bookmark/LOAD_CUSTOM_PAIR", this.username);
    }
  },
  async mounted() {
    this.$store.commit("bookmark/LOAD_BOOKMARK", this.username);
    this.$store.commit("bookmark/LOAD_CUSTOM_PAIR", this.username);
    try {
      Promise.all([
        await this.loadAllBases(),
        await this.loadCustomAssetsData()
      ]).then(() => {
        if (!this.intervalCustomData) {
          this.intervalCustomData = setInterval(async () => {
            await this.loadCustomAssetsData();
          }, this.tradesRefreshRate);
        }
      });
      // await this.loadAllBases();
    } catch (e) {
      console.error(e);
    }
    loopFlag = setInterval(this.refreshDatas, this.tradesRefreshRate);
  },
  beforeDestroy() {
    if (loopFlag) {
      clearInterval(loopFlag);
      loopFlag = null;
    }
    if (this.intervalCustomData) {
      clearInterval(this.intervalCustomData);
      this.intervalCustomData = null;
    }
    if (this.scrollhash) {
      this.scrollhash.forEach(ps => (ps.destroy ? ps.destroy() : null));
    }
  }
};
</script>

