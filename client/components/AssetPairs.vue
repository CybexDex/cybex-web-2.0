<template>
  <span class="asset-pair-wrapper" :style="styleObject" :title="title">
    <!-- 如果只有单个id或者名字 -->
    <template v-if="assetName">
      <div
        class="asset-name single"
        :class="{'c-custom-coin': isCustomAssetName}"
        :style="isCustomAssetName ? colorObject : ''"
      >{{ assetName | shorten | shortenContest(shortenGame) }}</div>
    </template>
    <!-- 如果是交易对 -->
    <template v-else>
      <div
        class="asset-name pairs"
        :class="{'c-custom-coin': isCustomQuoteName}"
        :style="quoteStyleObject"
      >
        <span>{{ quoteName | shorten | shortenContest(shortenGame) }}</span>
      </div>
      <template v-if="spacer">&nbsp;/&nbsp;</template>
      <template v-else>/</template>
      <div
        class="asset-name pairs"
        :class="{'c-custom-coin': isCustomBaseName}"
        :style="isCustomBaseName ? colorObject: ''"
      >
        <span>{{ baseName | shorten | shortenContest(shortenGame) }}</span>
      </div>
    </template>
  </span>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  props: {
    maxWidth: {
      type: String,
      default: ""
    },
    maxQuoteWidth: {
      type: String,
      default: ""
    },
    colorOpacity: {
      type: Number,
      default: 1
    },
    baseId: {
      type: String,
      default: ""
    },
    quoteId: {
      type: String,
      default: ""
    },
    spacer: {
      type: Boolean,
      default: true
    },
    assetId: {
      type: String,
      default: ""
    },
    shortenGame: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      baseName: "",
      quoteName: "",
      assetName: ""
    };
  },
  watch: {
    baseId: {
      immediate: true,
      async handler(newVal, oldVal) {
        if (newVal) {
          this.baseName = await this.checkNameById(newVal);
        }
      }
    },
    quoteId: {
      immediate: true,
      async handler(newVal, oldVal) {
        if (newVal) {
          this.quoteName = await this.checkNameById(newVal);
        }
      }
    },
    assetId: {
      immediate: true,
      async handler(newVal, oldVal) {
        if (newVal && !this.baseId && !this.quoteId) {
          this.assetName = await this.checkNameById(newVal);
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      whitelist: "user/whitelist",
      coins: "user/coins",
      game_prefix: "exchange/game_prefix",
      prefix: "exchange/prefix"
    }),
    styleObject() {
      let obj = {};
      if (this.maxWidth) {
        obj["max-width"] = this.maxWidth;
      }
      return obj;
    },
    quoteStyleObject() {
      let obj = {};
      if (this.maxQuoteWidth) {
        obj["max-width"] = this.maxQuoteWidth;
      }
      if (this.isCustomQuoteName) {
        obj = Object.assign(obj, this.colorObject);
      }
      return obj;
    },
    colorObject() {
      return {
        opacity: this.colorOpacity
      };
    },
    title() {
      return this.assetName
        ? `${this.$options.filters.shorten(this.assetName)}`
        : `${this.$options.filters.shorten(
            this.quoteName
          )} / ${this.$options.filters.shorten(this.baseName)}`;
    },
    isCustomAssetName() {
      return this.isInCustomAsset(this.assetName);
    },
    isCustomQuoteName() {
      return this.isInCustomAsset(this.quoteName);
    },
    isCustomBaseName() {
      return this.isInCustomAsset(this.baseName);
    }
  },

  methods: {
    ...mapActions({
      loadCoin: "user/load_coinmap"
    }),
    isInCustomAsset(name) {
      if (!name || !this.whitelist) return;
      // 不在白名单或者是竞赛币都认为是自定义币种
      // 不在白名单 但是开头是JADE.或者TEST.的币过滤
      const isInWhitelist = this.whitelist[name];
      const isWhitePrefix = new RegExp(`^${this.prefix}`).test(name);
      const isGameAsset = new RegExp(`^${this.game_prefix}`).test(name);
      return (isInWhitelist || isWhitePrefix) && !isGameAsset ? false : true;
    },
    async checkNameById(id) {
      let name = id;
      if (new RegExp(/^(1\.3\.)/g).test(id)) {
        // 传入的是数字, 先在白名单列表中查询，如果不是默认资产
        name = this.coins ? this.coins[id] : null;
        if (!name) {
          // 通过id查询名字
          let r = await this.cybexjs.queryAsset(id);
          name = r.symbol;
        }
      }
      return name;
    }
  }
};
</script>
<style lang="stylus">

// dropdown
.asset-dropdown {
  .v-select-list.ps {
    max-height: 300px;
    overflow-y: auto;
  }
}
.asset-pair-wrapper {
  display: inline-flex;
  max-width: 100%;

  .asset-name {
    overflow: hidden;
    max-width: 100%;
    text-align: left;

    &.pairs {
      display: inline-flex;
      flex: 0 1 auto;
      &:first-child {
        flex-shrink: 0;
      }

      > * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &.single {
      min-width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// button
.v-btn {
  &.theme--cybex-dark {
    .c-custom-coin {
      color: rgba(white, 1) !important;
    }

    &.v-btn--disabled {
      .c-custom-coin {
        color: rgba(120, 129, 154, 0.3) !important;
      }
    }
  }
}

// table
.cybex {
  .v-table.theme--dark {
    tr {
      &:hover {
        td {
          .c-custom-coin {
            color: rgba(#ffc478, 1) !important;
            opacity: 1;
          }
        }
      }

      td {
        .c-custom-coin {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
