<template>
  <div class="transfer">
    <v-layout row wrap class="mt-5">
      <v-flex xs12>
        <h1 class="main-title mb-4">{{ $t(`title.${fundtype}`) }}</h1>
        <h3 class="selection-title">{{ $t(`sub_title.select_${fundtype}`) }}</h3>
      </v-flex>
      <v-flex xs12 class="select-head mb-3">
        <v-menu
          content-class="selection-popover"
          v-model="showSelection"
          :open-on-click="false"
          :close-on-content-click="false"
          solo
        >
          <div class="selection" @click="onOpenSelect" slot="activator">
            <template v-if="selected">
              <div
                v-if="isTransfer && customAssetsMap[selected.cybid]"
                class="ic-asset-icon-bg asset-icon-bg mr-0"
              >{{ selected.cybid | coinName(coinMap) | shorten | shortenContest | firstLetterCoin }}</div>
              <v-img
                v-else
                class="img-box"
                :src="iconMap[selected.cybid]"
                max-width="20"
                width="20"
                height="20"
              />
              <span class="ml-2 name-column text-left">
                <asset-pairs :asset-id="selected.cybid" :shorten-game="false"/>
              </span>
              <span
                v-if="fundtype !== 'transfer' && (selected || {}).projectname"
                class="ml-2 full-name text-right"
              >({{ selected.projectname }})</span>
              <v-spacer/>
              <v-icon>{{ showSelection ? 'ic-arrow_up' : 'ic-arrow_drop_down' }}</v-icon>
            </template>
          </div>
          <div class="dwlist">
            <perfect-scrollbar
              :options="{
                swipeEasing: false,
                wheelPropagation: false
              }"
            >
              <v-list>
                <v-list-tile ripple>
                  <cybex-text-field
                    middle
                    no-message
                    v-model="querystr"
                    prepend-inner-icon="ic-search"
                    :placeholder="$t('placeholder.dw_filter')"
                  />
                </v-list-tile>
                <template v-if="itemList.length > 0">
                  <v-list-tile
                    v-for="item in itemList"
                    :key="item.cybid"
                    @click="onSelected(item)"
                    ripple
                  >
                    <div class="select-wrap">
                      <div
                        v-if="isTransfer && customAssetsMap[item.cybid]"
                        class="ic-asset-icon-bg asset-icon-bg mr-0"
                      >{{ customAssetsMap[item.cybid] | shorten | shortenContest | firstLetterCoin }}</div>
                      <v-img
                        v-else
                        max-width="20"
                        width="20px"
                        height="20px"
                        :src="iconMap[item.cybid]"
                      />
                      <span class="ml-2 name-column text-left">
                        <asset-pairs :asset-id="item.cybid"/>
                      </span>
                      <span
                        v-if="fundtype !== 'transfer' && selected && selected.projectname"
                        class="ml-2 full-name text-right"
                      >({{ item.projectname }})</span>
                    </div>
                  </v-list-tile>
                </template>
                <v-list-tile v-else>
                  <h4 class="no-data text-center mt-2 mb-2">{{ $t('info.no_data') }}</h4>
                </v-list-tile>
              </v-list>
            </perfect-scrollbar>
          </div>
        </v-menu>
        <div v-if="!isTransfer" class="shortcut">
          <template v-for="(coin, index) in coins">
            <v-chip
              ref="shortcut"
              class="select_coin"
              v-if="fullList.findIndex(i=>i[`${fundtype}Switch`] && ((coinMap[i.cybid] || '').indexOf(coin) > -1)) > -1"
              :key="index"
              :selected="selectedCoin(index)"
              label
              @click="onSelected(prefix + coin)"
            >{{ coin }}</v-chip>
          </template>
        </div>
      </v-flex>
      <v-flex xs12 class="content-wrap mt-3">
        <div class="content-detail pt-3 pb-5">
          <slot/>
        </div>
        <div class="notice-wrap">
          <template v-if="!isTransfer">
            <div class="img-link mt-3 mb-2">
              <a v-if="icon.link" @click="open(icon.link)">
                <v-img :src="icon.img_url" width="48" max-width="48" :height="48"/>
              </a>
              <v-img v-else :src="icon.img_url" width="48" max-width="48" :height="48"/>
            </div>
            <div class="img-head pb-2 pt-2">
              <div class="mb-2 pb-1" v-for="(item, index) in msg" :key="index">
                <template v-if="item.value">
                  <span class="tlt mb-2">{{ item.key }}:</span>&nbsp;
                  <a
                    class="coin-info"
                    v-if="item.link"
                    @click="open(item.link)"
                  >{{ item.value }}</a>
                  <span class="coin-info" v-else>{{ item.value }}</span>
                </template>
              </div>
            </div>
          </template>
          <div class="notice-head mt-3">
            <v-icon size="18" class="mr-2">ic-info-orange</v-icon>
            <span v-if="!isTransfer">{{ notice.title }}</span>
            <span v-else>{{ $t('sub_title.important_notice') }}</span>
          </div>
          <div class="mt-4 mb-4" v-if="!isTransfer">
            <p class="add mb-0" v-for="(item, index) in notice.adds" :key="index">{{ item.text }}</p>
            <span
              class="add mt-3"
              v-html="$t(`info.go_${fundtype}_history`, { url: `javascript:jumpTo('/fund/history')` })"
            />
          </div>
          <div class="mt-4 mb-4 notice-local" v-else v-html="$t('info.transfer_notice')"/>
        </div>
      </v-flex>
      <v-flex xs12 class="mt-5">
        <h3 class="mb-4">{{ $t(`sub_title.record_${fundtype}`) }}</h3>
        <template v-if="!isTransfer">
          <div v-if="islocked" class="desc-wrap">
            <cybex-btn
              small
              class="mt-2 text-capitalize"
              @click="onUnlockClicked"
            >{{ $t('button.unlock_view') }}</cybex-btn>
          </div>
          <history-list :fundtype="fundtype" :asset="assetInfo.name" v-else/>
        </template>
        <template v-else>
          <transfer-history-list/>
        </template>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import utils from "~/components/mixins/utils";
import { filter, map, cloneDeep, values, assign, sortBy } from "lodash";

export default {
  mixins: [utils],
  props: {
    fundtype: {
      type: String,
      default: "deposit"
    }
  },
  data() {
    return {
      querystr: "",
      coins: ["BTC", "ETH", "EOS", "USDT"],
      selected: null,
      records: [],
      page: 0,
      history: [],
      size: 10,
      offset: 1,
      total: 0,
      // notice
      icon: {},
      msg: {},
      notice: {},
      showSelection: false
    };
  },
  components: {
    HistoryList: () => import("~/components/HistoryList.vue"),
    TransferHistoryList: () => import("~/components/TransferHistoryList.vue")
  },
  computed: {
    ...mapGetters({
      prefix: "exchange/prefix",
      coinMap: "user/coins",
      coinMapInvert: "user/coinsInvert",
      withdraw: "user/withdraw",
      deposit: "user/deposit",
      locale: "i18n/locale",
      shortcut: "i18n/shortcut",
      icons: "user/icons",
      islocked: "auth/islocked",
      defaultAsset: "exchange/defaultAsset",
      cointype: "dwCoinType",
      userAssets: "user/userAssets",
      assets: "user/assets",
      game_prefix: "exchange/game_prefix",
      username: "auth/username",
      assetConfig: 'user/assetConfigBySymbol',
      customAssetsMap: 'user/customAssets'
    }),
    transfer() {
      return map(filter(this.userAssets, j => parseFloat(j.balance) > 0 && !(this.coinMap[j.asset_id] || this.customAssetsMap[j.asset_id] || '').startsWith(this.game_prefix)), i => {
        return {
          cybid: i.asset_type,
          isCustom: !!this.customAssetsMap[i.asset_type],
          cybname: this.coinMap[i.asset_type] || this.customAssetsMap[i.asset_type]
        };
      })
    },
    fullList() {
      if (this.fundtype === "transfer") {
        return this.transfer;
      } else {
        return values(this.assetConfig).map(o => {
          return assign(o, { enable: this.fundtype === 'withdraw' ? o.withdrawSwitch : o.depositSwitch })
        })
      }
    },
    itemList() {
      return filter(this.fullList, item => 
        (!this.querystr || (this.coinMap[item.cybid] || '').indexOf(this.querystr.toUpperCase()) >= 0)
          && (this.fundtype === "transfer" || item[`${this.fundtype}Switch`])
          && (!this.selected || this.selected.cybid !== item.cybid)
      );
    },
    iconMap() {
      return this.icons || [];
    },
    isTransfer() {
      return this.fundtype === "transfer";
    },
    assetInfo() {
      return this.assetConfig[this.cointype]
    }
  },
  watch: {
    fullList(list) {
      if (this.fundtype === "transfer") {
        this.ensureSelected(list, this.cointype);
      }
    },
    async islocked(newval) {
      if (newval) {
        this.history = [];
        this.size = 10;
        this.offset = 1;
      } else {
        this.asset = this.cointype;
      }
    },
    cointype(value) {
      if (this.fundtype !== "transfer") {
        this.loadOpInfo(value)
      }
      this.ensureSelected(this.fullList, value)
    },
    async username(){
      this.selected = null;
    }
  },
  methods: {
    ...mapActions({
      load_icons: "user/load_icons"
    }),
    selectedCoin(idx) {
      return (
        this.coins.findIndex(i => this.prefix + i === this.cointype) === idx
      );
    },
    onOpenSelect() {
      this.showSelection = !this.showSelection;
    },
    onBlured() {
      this.querystr = "";
    },
    ensureSelected(list, cointype) {
      if (list && !this.selected) {
        this.selected = list.find(item => (this.customAssetsMap[item.cybid] || this.coinMap[item.cybid]) === cointype);
      }
    },
    async loadOpInfo(cointype) {
      const handler = this.fundtype === 'withdraw' ? this.cybexjs.withdraw_infos : this.cybexjs.deposit_infos
      try {
        const param = this.coinMapInvert[this.cointype];
        const datas = await this.$callmsg(handler, param);
        this.icon = datas[`icon_${this.shortcut}`];
        this.msg = datas[`msg_${this.shortcut}`];
        this.notice = datas[`notice_${this.shortcut}`];
      } catch (e) { console.log(e) }
    },
    async onSelected(val) {
      if (!val) return;
      const coinname = typeof val === "string" ? val : val.cybname || this.coinMap[val.cybid] || this.customAssetsMap[val.cybid];
      this.selected = this.assetConfig[coinname]
      this.$nextTick(() => {
        this.showSelection = false;
      });
      this.$i18n.jumpTo(`/fund/${this.fundtype}/${coinname}`);
    },
    onUnlockClicked() {
      this.$toggleLock();
    }
  },
  async mounted() {
    window.jumpTo = this.$i18n.jumpTo;
    if (this.fundtype !== "transfer") {
      await this.loadOpInfo(this.cointype)
    }
    if (this.fullList && this.cointype) {
      this.ensureSelected(this.fullList, this.cointype)
    }
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

$menu-height = 376px;

.custom-pic {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.selection-popover {
  font-size: 12px;
  margin-top: 43px;
  overflow-y: hidden;
  max-height: $menu-height !important;

  .dwlist {
    width: 464px;
    height: $menu-height;
    overflow-y: hidden;

    .no-data {
      width: 100%;
      line-height: 56px;
      background-color: $main.independence;
    }

    .v-list.theme--dark {
      border-radius: 4px;
      box-shadow: 0 8px 10px 0 rgba(0, 0, 0, 0.2), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 16px 24px 2px rgba(0, 0, 0, 0.14);
      background-color: $main.independence;
      min-height: $menu-height;

      .v-input__slot {
        background-color: rgba(255, 255, 255, 0.04) !important;
      }

      .select-wrap {
        padding-left: 0px;
        width: 424px;
        line-height: 56px;
        font-size: 12px;
        height: 56px;
        box-shadow: inset 0 -1px 0 0 $main.anchor;
        display: flex;
        align-items: center;
      }

      .v-list__tile {
        height: 56px;
        border-radius: 4px;

        // box-shadow: inset 0 -1px 0 0 $main.anchor;
        &:hover:not(:first-of-type) {
          height: 56px;
          background-color: rgba($main.white, 0.04);
        }
      }
    }
  }

  .name-column {
    f-cybex-style('heavy');
    color: $main.white;
  }

  .full-name {
    color: rgba($main.grey, 0.8);
  }
}

.shortcut {
  margin-left: 16px;
}

.transfer {
  min-width: 1088px;
  margin: 0 96px;

  .history-list {
    .v-datatable.v-table.theme--dark {
      tr, td, tr th, .table-tlt, thead {
        background: dark !important;
      }
    }

    .v-toolbar__content {
      background: dark !important;
    }
  }

  .desc-wrap {
    margin: 0 auto;
    width: 800px;
    text-align: center;

    .v-btn {
      width: initial !important;
      height: 32px !important;
      border-radius: 4px;

      .v-btn__content {
        font-size: 12px !important;
        padding: 0 18px;
      }
    }
  }

  .select-head {
    display: flex;
    align-items: center;

    .v-select {
      &, & .v-input__control {
        height: 40px !important;
        max-width: 464px !important;
        width: 464px !important;

        .v-input__slot {
          height: 40px !important;
          max-width: 464px;
        }
      }
    }
  }

  .content-wrap {
    background: exchange-container-bg;
    display: flex;
    align-items: center;

    .content-detail {
      width: 465px;
    }
  }

  .v-menu__activator--active .selection {
    background-color: $main.independence;
  }

  .selection {
    width: 464px;
    height: 40px;
    border-radius: 4px;
    background-color: $main.anchor;
    padding: 0 12px 0 16px;
    display: flex;
    align-items: center;
    font-size: 12px;
    f-cybex-style('heavy');
  }

  .img-head {
    box-shadow: inset 0 -1px 0 0 #111621;
  }

  .notice-wrap {
    width: 560px;
    padding-left: 90px;
    padding-right: 20px;
    font-size: 12px;
    f-cybex-style(medium);

    .img-link {
      width: 48px;
      height: 48px;
    }

    .tlt {
      color: rgba(255, 255, 255, 0.3);
      font-size: 12px;
      f-cybex-style(medium);
    }

    .coin-info {
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
      f-cybex-style(medium);
    }

    a.coin-info {
      text-decoration: underline;
    }

    .notice-head {
      font-size: 14px;
      f-cybex-style('black', medium);
      line-height: 1.71;
    }

    .main {
      color: orange;
    }

    .add {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.67;
      width: 428px;

      a {
        color: orange;
      }
    }
  }

  .theme--dark.v-btn {
    padding: 0;
    margin: 0;
    height: 48px;
    width: 100%;
    background-image: linear-gradient(96deg, #ffc478, #ff9143);
    opacity: initial;

    &.btn-unlock {
      width: 140px;
      height: 32px;
      padding: 0;
      margin: 0;

      & .v-btn__content {
        font-size: 12px;
        text-transform: capitalize !important;
      }
    }

    &.v-btn__content {
      font-size: 16px;
      color: white;
    }
  }

  &>.layout {
    min-width: 800px;
  }

  .notice-head {
    margin-top: 24px;

    span {
      font-size: 14px;
      f-cybex-style('black', medium);
      line-height: 24px;
    }

    .v-icon {
      line-height: 18px;
      width: 18px !important;
      height: 18px;
      background-size: contain;
    }
  }

  .notice-local {
    line-height: 20px;

    ul {
      padding-left: 14px;

      li {
        list-style-type: disc;
        color: orange;
        padding-inline-start: 4px;

        p {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
}
</style>
