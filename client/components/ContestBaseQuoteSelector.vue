<!-- 交易大赛指定交易对选择下拉菜单 -->
<template>
  <v-flex class="filter-pairs c-white-30" d-flex row align-center>
    <label class="c-white-30 mr-2">{{ $t(label) }}:</label>
    <v-flex>
      <v-autocomplete
        dark
        class="pairs-items text-xs-right small-size"
        :items.sync="quoteItems"
        :append-icon="'ic-arrow_drop_down'"
        v-model="selectedQuote"
        cache-items
        flat
        hide-no-data
        hide-details
        height="24"
        solo
        item-text="symbol"
        item-value="id"
        :menu-props="{'offset-y':true, 'maxWidth': '120', 'contentClass': 'ps-dropdown ps-dropdown-quote', 'nudgeBottom': '12'}"
      >
        <template slot="item" slot-scope="{ item }">
          <v-list-tile-content>
            <v-list-tile-title :title="item.symbol">
              <asset-pairs v-if="item.id" :asset-id="item.id"/>
              <span v-else>{{ item.symbol }}</span>
            </v-list-tile-title>
          </v-list-tile-content>
        </template>
      </v-autocomplete>
    </v-flex>
    <span>/</span>
    <v-flex>
      <v-autocomplete
        dark
        class="pairs-items small-size"
        :items.sync="baseItems"
        height="24"
        :append-icon="'ic-arrow_drop_down'"
        v-model="selectedBase"
        cache-items
        flat
        hide-no-data
        hide-details
        solo
        item-text="symbol"
        item-value="id"
        :menu-props="{'offset-y':true, 'maxWidth': '120', 'contentClass': 'ps-dropdown ps-dropdown-base', 'nudgeBottom': '12'}"
      >
        <template slot="item" slot-scope="{ item }">
          <v-list-tile-content>
            <v-list-tile-title :title="item.symbol">
              <asset-pairs v-if="item.id" :asset-id="item.id"/>
              <span v-else>{{ item.symbol }}</span>
            </v-list-tile-title>
          </v-list-tile-content>
        </template>
      </v-autocomplete>
    </v-flex>
  </v-flex>
</template>

<script>
import { mapGetters } from "vuex";
import { indexOf, findIndex, mapValues, map, keys, sortBy } from "lodash";
import utils from "~/components/mixins/utils";
import PerfectScrollbar from "perfect-scrollbar";
import config from "~/lib/config/config.js";

export default {
  props: {
    label: {
      type: String,
      default: "exchange.order-table.filter.pairs"
    },
    selectedPair: {
      type: Object,
      default: () => {}
    },
    sortByLetter: {
      type: Boolean,
      default: true
    }
  },
  model: {
    prop: "selectedPair",
    event: "update-pair"
  },
  data() {
    return {
      showBaseDropdown: false,
      showQuoteDropdown: false,
      inputVal: "",
      baseItems: [],
      quoteItems: []
    };
  },
  watch: {
    selectedQuote: function(selectedQuote) {
      let setted = false;
      this.baseItems.forEach((v, index) => {
        const enabled = this.couldBeEnabled(v.children, selectedQuote);
        if (enabled && !setted) {
          this.selectedBase = v.id;
          setted = true;
        }
        this.$set(this.baseItems[index], "disabled", !enabled);
      });
    }
  },
  computed: {
    ...mapGetters({
      bases: "user/bases",
      coinMap: "user/coins",
      coinsInvert: "user/coinsInvert"
    }),
    selectedBase: {
      get: function() {
        let v = this.selectedPair.hasOwnProperty("base_id")
          ? this.selectedPair.base_id
          : "";
        return v;
      },
      set: function(v) {
        this.$emit("update-pair", { base_id: v, quote_id: this.selectedQuote });
      }
    },
    selectedQuote: {
      get: function() {
        let v = this.selectedPair.hasOwnProperty("quote_id")
          ? this.selectedPair.quote_id
          : "";
        return v;
      },
      set: function(v) {
        this.$emit("update-pair", {
          base_id: "",
          quote_id: v
        });
      }
    }
  },
  methods: {
    // 根据配置的指定交易对列表
    async getGameAssetList() {
      const assetList = config.gamePairs;
      let result = {};
      let baseArr = [],
        quoteArr = [];
      for (const item of assetList) {
        const [quote_id, base_id] = item;
        const quoteInfo = await this.cybexjs.queryAsset(quote_id);
        const baseInfo = await this.cybexjs.queryAsset(base_id);
        if (!find(quoteArr, { id: quote_id })) {
          quoteArr.push({
            id: quote_id,
            symbol: this.$options.filters.shortenContest(
              quoteInfo.symbol,
              true
            ),
            parent: base_id
          });
        }
        let findBase = findIndex(baseArr, { id: base_id });
        if (findBase == -1) {
          baseArr.push({
            id: base_id,
            symbol: this.$options.filters.shortenContest(baseInfo.symbol, true),
            children: [quote_id]
          });
        } else {
          baseArr[findBase].children.push(quote_id);
        }
      }
      // 此处加上await promise由于发现i18n跳转时未初始化完成报错
      await new Promise((resolve) => {
        setTimeout(() => {
          quoteArr.unshift({
            id: "",
            parent: "",
            symbol: this.$t("exchange.content.all")
          });
          baseArr.unshift({
            id: "",
            symbol: this.$t("exchange.content.all"),
            disabled: !this.couldBeEnabled(["all"], this.selectedQuote),
            children: ["all"]
          });
          result = {
            baseArr: baseArr,
            quoteArr: quoteArr
          }
          resolve(true);
        }, 100);
      });
      return result;
    },
    couldBeEnabled(search, selectedQuote) {
      // console.log('search', search, selectedQuote, indexOf(search, selectedQuote));
      return indexOf(search, selectedQuote) > -1;
    },
    checkOption(event) {
      event.preventDefault();
    }
  },
  mixins: [utils],
  async mounted() {
    let r = await this.getGameAssetList();
    console.log('r' ,r);
    this.baseItems = r.baseArr;
    this.quoteItems = r.quoteArr;
  }
};
</script>