<template>
  <div>
    <v-flex d-flex grow v-if="size == 'middle'"><div class="input-label">{{ $t('custom.quote-label') }}</div></v-flex>
    <v-flex d-flex :class="['size-' + size, size == 'middle' ? 'mb-4' : '']">
      <label v-if="size == 'small'" class="c-white-30 mr-2">{{ $t(label) }}:</label>
      <v-flex column shrink class="selector-item">
        <v-autocomplete
          :clearable="size != 'small'"
          :cache-items="false"
          :attach="'.search-for-quote'"
          :return-masked-value="false"
          class="search-for-quote"
          :class="size+'-size'"
          dont-fill-mask-blanks
          v-model="customAssetQuote"
          :menu-props="{'maxWidth': maxWidth > 0 ? maxWidth / 2 : '', 'contentClass': 'asset-dropdown ps-dropdown-quote', 'offset-y': true, 'nudgeBottom': 8, 'max-height': 300}"
          :items="searchAssetQuoteItemsComputed"
          :search-input.sync="searchAssetQuote"
          :loading="isLoadingSearchAssetQuote"
          no-message
          item-text="symbol"
          item-value="id"
          :placeholder="$t('custom.search-placeholder')"
          solo
        >
          <template slot="no-data">
            <v-list-tile>
              <v-list-tile-title v-if="!searchAssetQuote">{{ $t('custom.search-placeholder') }}</v-list-tile-title>
              <v-list-tile-title v-else-if="!isLoadingSearchAssetQuote">{{ $t('custom.no-result') }}</v-list-tile-title>
            </v-list-tile>
          </template>
          <template slot="item" slot-scope="{ item }">
            <v-list-tile-content>
              <v-list-tile-title :title="item.symbol">
                <asset-pairs :asset-id="item.symbol" />
              </v-list-tile-title>
            </v-list-tile-content>
          </template>
        </v-autocomplete>
      </v-flex>
      <span class="spacer ml-1 mr-1 pt-1">/</span>
      <v-flex column shrink class="selector-item">
        <v-autocomplete
          :clearable="size != 'small'"
          :cache-items="false"
          :return-masked-value="true"
          dont-fill-mask-blanks
          :attach="'.search-for-base'"
          class="search-for-base"
          :class="size+'-size'"
          v-model="customAssetBase"
          :menu-props="{'maxWidth': maxWidth > 0 ? maxWidth / 2 : '', 'contentClass': 'asset-dropdown ps-dropdown-base', 'offset-y': true, 'nudgeBottom': 8, 'max-height': 300}"
          :items="searchAssetBaseItemsComputed"
          :search-input.sync="searchAssetBase"
          :loading="isLoadingSearchAssetBase"
          no-message
          item-text="symbol"
          item-value="id"
          :placeholder="$t('custom.search-placeholder')"
          solo
        >
          <template slot="no-data">
            <v-list-tile>
              <v-list-tile-title v-if="!searchAssetBase">{{ $t('custom.search-placeholder') }}</v-list-tile-title>
              <v-list-tile-title v-else-if="!isLoadingSearchAssetBase">{{ $t('custom.no-result') }}</v-list-tile-title>
            </v-list-tile>
          </template>
          <template slot="item" slot-scope="{ item }">
            <v-list-tile-content>
              <v-list-tile-title :title="item.symbol">
                <asset-pairs :asset-id="item.symbol" />
              </v-list-tile-title>
            </v-list-tile-content>
          </template>
        </v-autocomplete>
      </v-flex>
    </v-flex>
  </div>
</template>

<script>
import { filter } from "lodash";
export default {
  props: {
    label: {
      type: String,
      default: "exchange.order-table.filter.pairs"
    },
    maxWidth: {
      type: Number,
      default: 0
    },
    size: {
      type: String,
      default: 'middle'
    },
    selectedPair: {
      type: Object,
      default: () => {}
    },
    excludeRule: {
      type: RegExp,
      default: null
    }
  },
  model: {
    prop: "selectedPair",
    event: "update-pair"
  },
  data() {
    return {
      searchAssetQuoteItems: [], // 搜索用用户自定义资产列表
      searchAssetBaseItems: [], // 搜索用用户自定义资产列表
      searchAssetQuote: "", // 输入值
      searchAssetBase: "", // 输入值
      isLoadingSearchAssetQuote: false,
      isLoadingSearchAssetBase: false
    };
  },
  computed: {
    customAssetQuote: {
      get: function() {
        let v = this.selectedPair.hasOwnProperty("quote_id")
          ? this.selectedPair.quote_id
          : "";
        return v;
      },
      set: function(v) {
        this.$emit("update-pair", { quote_id: v, base_id: this.customAssetBase });
      }
    },
    customAssetBase: {
      get: function() {
        let v = this.selectedPair.hasOwnProperty("base_id")
          ? this.selectedPair.base_id
          : "";
        return v;
      },
      set: function(v) {
        this.$emit("update-pair", { base_id: v, quote_id: this.customAssetQuote });
      }
    },
    searchAssetQuoteItemsComputed() {
      let items = this.searchAssetQuoteItems;
      if (this.customAssetBase !== null) {
        items = filter(items, i => {
          return i.id != this.customAssetBase;
        });
      }
      return items;
    },
    searchAssetBaseItemsComputed() {
      let items = this.searchAssetBaseItems;
      if (this.customAssetQuote !== null) {
        items = filter(items, i => {
          return i.id != this.customAssetQuote;
        });
      }
      return items;
    }
  },
  watch: {
    // search for custom asset
    searchAssetQuote(val, oldVal) {
      this.searchCustomAssetByKey(val, "quote");
    },
    searchAssetBase(val, oldVal) {
      this.searchCustomAssetByKey(val, "base");
    },
    customAssetQuote(val) {
      this.$emit('model-change', ['quote', val]);
    },
    customAssetBase(val) {
      this.$emit('model-change', ['base', val]);
    }
  },
  methods: {
    // 搜索自定义交易对
    async searchCustomAssetByKey(search, type) {
      if (type == "quote") {
        this.searchAssetQuoteItems = [];
      }
      if (type == "base") {
        this.searchAssetBaseItems = [];
      }
      if (!search) {
        return;
      }
      await this.$eventHandle(async () => {
        if (type == "quote") {
          this.isLoadingSearchAssetQuote = true;
        }
        if (type == "base") {
          this.isLoadingSearchAssetBase = true;
        }
        let res = await this.cybexjs.suggest_asset(
          search ? search.toUpperCase() : ""
        );
        return res;
      }, [])
        .then(res => {
          let items = [];
          res.map(i => {
            // 符合过滤条件
            if (this.excludeRule && i && this.excludeRule.test(i.symbol)) {
              // console.log('过滤了', i.symbol)
              return;
            }
            items.push({
              id: i.id,
              symbol: i.symbol
            });
          });
          if (type == "quote") {
            this.searchAssetQuoteItems = items;
          }
          if (type == "base") {
            this.searchAssetBaseItems = items;
          }
        })
        .catch(e => {
          console.error(e);
        })
        .finally(() => {
          if (type == "quote") {
            this.isLoadingSearchAssetQuote = false;
          }
          if (type == "base") {
            this.isLoadingSearchAssetBase = false;
          }
          this.$emit('search-custom-asset-end', type);
        });
    }
  }
};
</script>

<style lang="stylus">
.size-small {
  flex: 0 1 315px !important;
  margin-right: 32px;
  .v-text-field__details {
    display: none;
    margin: 0;
  }
  .selector-item {
    max-width: 120px;
  }
}
</style>