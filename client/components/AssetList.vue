<template>
  <div class="account index-wrap">
    <div class="head-line ml-4 mr-5">
      <cybex-text-field
        middle
        no-message
        v-model="querystr"
        clearable
        prepend-inner-icon="ic-search"
        :placeholder="$t('placeholder.search_asset')"
      />
      <cybex-checkbox class="ml-3" small height="40" align-items-center v-model="hideSmall">
        <div class="check-label" slot="label">
          {{ $t('form_label.hide_small') }}
          <notice-tip
            class="ml-2"
            slot="label"
            :content="$t('tooltip.small_asset', {smallAmount})"
            :offset="120"
          />
        </div>
      </cybex-checkbox>
      <notice-tip :content="$t('tooltip.create_asset')" :offset="120">
        <template slot="hooker">
          <cybex-btn @click="createAsset" small color="minor">
            <v-icon class="add-icon mr-2">ic-add</v-icon>
            <span class="add-label">{{ $t('button.create_asset') }}</span>
          </cybex-btn>
        </template>
      </notice-tip>
    </div>
    <v-layout fluid row wrap>
      <v-flex xs12 fluid>
        <div class="table-wrapper">
          <v-data-table
            :headers="tbItems"
            :items="itemDatas"
            :loading="!assets"
            hide-actions
            :dark="false"
          >
            <template slot="headerCell" slot-scope="props">
              <a class="table-tlt" v-if="props.header.canSort" @click="onSortClick(props)">
                {{ props.header.text }}
                <v-icon>{{ props.header.value === sortBase ? (sortMap[props.header.value] === 'asc' ? 'ic-sort_up' : 'ic-sort_down') : 'ic-sort' }}</v-icon>
              </a>
              <span class="table-tlt" v-else>{{ props.header.text }}</span>
            </template>
            <template slot="items" slot-scope="props">
              <tr :class="props.item.asset_type === endTopItem.asset_type ? 'top-end' : ''">
                <td class="text-xs-left">
                  <div class="coin-icon-wrap d-flex">
                    <v-img :src="iconMap[props.item.asset_type]" class="coin-icon ml-4"/>
                    {{ props.item.asset_type | coinName(coinMap) }}
                  </div>
                </td>
                <td
                  class="text-xs-right"
                >{{ props.item.balance | floorDigits(props.item.asset_type == '1.3.0' ? 5 : 6) }}</td>
                <td
                  class="text-xs-right"
                >{{ (props.item.frozenBalance || 0) | floorDigits(props.item.asset_type == '1.3.0' ? 5 : 6) }}</td>
                <td class="text-xs-right pr-1">
                  <template v-if="!coinMap[props.item.asset_type].startsWith(game_prefix)">
                    <div>{{ props.item.legalValue > 0 ? props.item.cybValue : 0 | floorDigits(5, -1) }}</div>
                  </template>
                </td>
                <td class="text-xs-left pa-0 value-equal">
                  <template
                    v-if="!coinMap[props.item.asset_type].startsWith(game_prefix)"
                  >≈ {{ props.item.legalValue > 0 ? props.item.legalValue : 0 | legalDigits(symbol) }}</template>
                </td>
                <td class="text-xs-right op">
                  <div class="op-wrap">
                    <template v-if="props.item.asset_type !== '1.3.0'">
                      <a
                        v-if="props.item.canDeposit"
                        class="op-item border"
                        @click="jumpTo(`/fund/deposit/${coinMap[props.item.asset_type]}`)"
                      >{{ $t('button.deposit') }}</a>
                      <template v-else>
                        <v-tooltip
                          :class="{'unopen': !props.item.canDeposit, 'border': true}"
                          v-if="(props.item.whyNotDeposit || {})[`${localeShort}Msg`]"
                          content-class="why-forbid-tip"
                          top
                        >
                          <span slot="activator" class="op-item">{{ $t('button.pause') }}</span>
                          <span>{{ (props.item.whyNotDeposit || {})[`${localeShort}Msg`] }}</span>
                        </v-tooltip>
                        <span v-else class="op-item unopen border">{{ $t('button.pause') }}</span>
                      </template>
                      <a
                        v-if="props.item.canWithdraw"
                        class="op-item border"
                        @click="jumpTo(`/fund/withdraw/${coinMap[props.item.asset_type]}`)"
                      >{{ $t('button.withdraw') }}</a>
                      <template v-else>
                        <v-tooltip
                          :class="{'unopen': !props.item.canDeposit, 'border': true}"
                          v-if="(props.item.whyNotWithdraw || {})[`${localeShort}Msg`]"
                          content-class="why-forbid-tip"
                          top
                        >
                          <span slot="activator" class="op-item">{{ $t('button.pause') }}</span>
                          <span>{{ (props.item.whyNotWithdraw || {})[`${localeShort}Msg`] }}</span>
                        </v-tooltip>
                        <span v-else class="op-item unopen border">{{ $t('button.pause') }}</span>
                      </template>
                    </template>
                    <div v-else style="width: 168px;"/>
                    <v-menu
                      bottom
                      width="42"
                      :nudge-bottom="20"
                      v-if="(quoteList[props.item.asset_type] || []).length > 0"
                    >
                      <a
                        class="op-item last"
                        slot="activator"
                        @click="onExchangeClicked"
                      >{{ $t('button.exchange') }}</a>
                      <div class="switch-exchange">
                        <v-list>
                          <v-list-tile
                            v-for="(base, index) in quoteList[props.item.asset_type]"
                            :key="index"
                            @click="jumpTo(`/exchange/${coinMap[props.item.asset_type]}_${coinMap[base]}`)"
                          >
                            <v-list-tile-title>{{ props.item.asset_type | coinName(coinMap) }}/{{ base | coinName(coinMap) }}</v-list-tile-title>
                          </v-list-tile>
                        </v-list>
                      </div>
                    </v-menu>
                    <span class="op-item unopen last" v-else>{{ $t('button.exchange') }}</span>
                  </div>
                </td>
              </tr>
            </template>
            <template slot="no-data">
              <h4 class="text-center">{{ $t('info.no_data') }}</h4>
            </template>
          </v-data-table>
        </div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import utils from "~/components/mixins/utils";
import { mapGetters, mapActions } from "vuex";
import { filter, find, orderBy, pickBy, keys, map, cloneDeep } from "lodash";
import config from "~/lib/config/config.js";

let self = this;

export default {
  components: {
    NoticeTip: () => import("~/components/NoticeTip.vue")
  },
  data() {
    return {
      hideSmall: false,
      querystr: "",
      topAssets: [],
      assets: null,
      tbItems: [
        {
          text: this.$t("table_title.coin"),
          value: "name",
          align: "left",
          sortable: false,
          canSort: true
        },
        {
          text: this.$t("table_title.avaliable_balance"),
          value: "balance",
          align: "right",
          sortable: false,
          canSort: true
        },
        {
          text: this.$t("table_title.frozen"),
          value: "frozenBalance",
          align: "right",
          sortable: false,
          canSort: true
        },
        {
          text: this.$t("table_title.balance_value"),
          value: "cybValue",
          align: "right",
          sortable: false,
          canSort: true,
          class: "pr-0"
        },
        {
          text: "",
          sortable: false
        },
        {
          text: this.$t("table_title.operation"),
          align: "right",
          class: "op-tlt",
          sortable: false
        }
      ],
      smallAmount: config.smallCYBAmount,
      sortMap: {
        name: "asc",
        balance: "desc",
        frozen: "desc",
        cybValue: "desc"
      },
      values: [],
      sortBase: null
    };
  },
  mixins: [utils],
  async mounted() {
    await this.loadAssets(this.username);
    this.topAssets = await this.$call(this.cybexjs.top_asset);
    try {
      await this.setupAssetList();
    } catch (e) {}
  },
  computed: {
    ...mapGetters({
      prefix: "exchange/prefix",
      username: "auth/username",
      coinMap: "user/coins",
      icons: "user/icons",
      bases: "user/bases",
      locale: "i18n/locale",
      localeShort: "i18n/shortcut",
      symbol: "i18n/symbol",
      assetList: "user/assets",
      game_prefix: "exchange/game_prefix"
    }),
    iconMap() {
      return this.icons || [];
    },
    itemDatas() {
      const filteredList = filter(this.assets || [], item => {
        return (
          (!this.querystr ||
            this.coinName(item.asset_type, this.coinMap).indexOf(
              this.querystr.toUpperCase()
            ) >= 0) &&
          (!this.hideSmall || item.cybValue >= this.smallAmount)
        );
      });
      return filteredList;
    },
    endTopItem() {
      return this.itemDatas.find(i => !i.isTop) || {};
    },
    quoteList: function() {
      const result = {};
      this.assets.forEach(item => {
        const picked = pickBy(
          this.bases,
          i => i.data.indexOf(item.asset_type) > -1
        );
        result[item.asset_type] = result[item.asset_type] || [];
        if (picked) {
          result[item.asset_type] = result[item.asset_type].concat(
            keys(picked)
          );
        }
      });
      return result;
    }
  },
  watch: {
    async username(val) {
      if (!val) {
        return;
      }
      await this.loadAssets(this.username);
      this.topAssets = await this.$call(this.cybexjs.top_asset);
      try {
        await this.setupAssetList();
      } catch (e) {}
    }
  },
  methods: {
    ...mapActions({
      setTotal: "user/setTotal",
      loadAssets: "user/loadAssets"
    }),
    onSortClick(data) {
      const header = data.header;
      const sort = this.sortMap[header.value] === "desc" ? "asc" : "desc";
      const idx = this.tbItems.findIndex(i => i.value === header.value);
      this.sortBase = header.value;
      // console.log('~~~~~ onSort: ', idx)
      // this.$set(this.tbItems, idx, cloneDeep(header.curSort))
      this.sortMap[header.value] = sort;
      this.assets = orderBy(
        this.assets,
        ["isTop", header.value],
        ["desc", sort]
      );
    },
    onExchangeClicked() {},
    async setupAssetList() {
      let a = cloneDeep(this.assetList);

      const [depo, withdr, _] = await Promise.all([
        this.$callmsg(this.cybexjs.deposit_list),
        this.$callmsg(this.cybexjs.withdraw_list),
        this.$callmsg(this.cybexjs.load_base_market)
      ]);
      // const withdr = await g.withdraw_list()
      let totalCyb = 0,
        totalLegal = 0;

      let legalId;
      if (this.locale === "zh") legalId = null;
      else legalId = this.prefix + "USDT";

      // console.log('==== total item: ', a.length)
      for (var i = 0; i < a.length; i++) {
        const withdrawItem = withdr.find(e => {
          return e.id === a[i].asset_type;
        });
        // if (a[i].balance != 0 && withdrawItem && withdrawItem.enable)
        if (withdrawItem && withdrawItem.enable) a[i].canWithdraw = true;
        else {
          a[i].canWithdraw = false;
          a[i].whyNotWithdraw = withdrawItem;
        }

        const depositItem = depo.find(e => {
          return e.id === a[i].asset_type;
        });
        if (depositItem && depositItem.enable) a[i].canDeposit = true;
        else {
          a[i].canDeposit = false;
          a[i].whyNotDeposit = depositItem;
        }

        // balance
        if (a[i].balance != 0) {
          const val = await this.$callmsg(
            this.cybexjs.assetAmount,
            a[i].asset_type,
            a[i].balance
          );
          let v = parseFloat(val);
          a[i].balance = v;
        } else {
          a[i].balance = 0;
        }

        a[i].name = this.coinName(a[i].asset_type, this.coinMap);
        a[i].isTop = this.topAssets.indexOf(a[i].asset_type) > -1 ? 1 : 0;
        // } else {
        //   a[i].cybValue = 0
        //   a[i].legalValue = 0
        // }
      }

      this.assets = orderBy(a, ["isTop", "balance"], ["desc", "desc"]);

      const values = [];
      await Promise.all(
        map(a, async (item, i) => {
          const frozen = await this.$callmsg(
            this.cybexjs.frozenBalances,
            this.username,
            a[i].asset_type
          );
          if (frozen && frozen != 0) {
            const val = await this.$callmsg(
              this.cybexjs.assetAmount,
              a[i].asset_type,
              frozen.balance
            );
            let v = parseFloat(val);
            a[i].frozenBalance = v;
          } else {
            a[i].frozenBalance = 0;
          }

          a[i].totalBalance = a[i].frozenBalance + a[i].balance;

          // console.log(a[i].totalBalance, a[i].frozenBalance, a[i].balance)

          // if (a[i].totalBalance != 0) {
          let cybValue = await this.$callmsg(
            this.cybexjs.assetValue,
            a[i].asset_type,
            a[i].totalBalance,
            "CYB"
          );
          let legalValue = await this.$callmsg(
            this.cybexjs.assetValue,
            a[i].asset_type,
            a[i].totalBalance,
            legalId
          );

          // if (a[i].asset_type == '1.3.22') {
          //   console.log('1.3.22')
          //   console.log(cybValue)
          //   console.log(legalValue)
          // }

          if (cybValue != -1) {
            totalCyb = totalCyb + cybValue;
          }

          if (legalValue != -1) {
            totalLegal = totalLegal + legalValue;
          }

          this.$set(a[i], "cybValue", cybValue);
          this.$set(a[i], "legalValue", legalValue);
          // a[i].cybValue = cybValue
          // a[i].legalValue = legalValue
        })
      );

      // console.log('totalCyb', totalCyb)
      // console.log('totalLegal', totalLegal)
      this.setTotal({ balance: totalCyb, value: totalLegal });
    },
    createAsset() {
      window.open(
        `${config.links.oldSite}/account/${this.username}/create-asset/`
      );
    }
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.why-forbid-tip {
  width: 232px;
  padding: 12px 16px;
  background-color: rgba(17, 22, 33, 0.92);
  opacity: 0.8;
  font-size: 14px;
  f-cybex-style(medium);
  line-height: 1.29;
  text-align: center;

  strong {
    color: $main.orange;
  }

  span {
    text-align: center;
  }
}

.account {
  .table-tlt {
    font-size: 12px;
    color: rgba($main.white, 0.4);
    f-cybex-style(medium);

    .v-icon {
      font-size: 1.8em;
      margin-right: -6px;
      margin-left: -4px;
      line-height: 0.8;
    }
  }

  &.index-wrap {
    background: $main.lead !important;
    border-radius: 4px;
  }

  .v-input__control {
    max-height: 40px;
    height: 40px;

    .v-input__slot {
      margin-bottom: 0px !important;
    }
  }

  .v-input__append-outer {
    line-height: 20px;
  }

  .op-tlt {
    padding-right: 48px !important;
  }

  .coin-icon-wrap {
    display: flex;
    align-items: center;

    .coin-icon {
      margin-right: 8px;
      width: 20px;
      height: 20px;
      flex: 0 0 20px !important;
    }
  }

  .head-line {
    height: 56px;
    display: flex;
    align-items: center;

    .v-text-field {
      flex: 0 1 384px;
    }

    .create-btn.v-btn {
      height: 31px;
      border-radius: 4px;
      padding: 0 !important;
      margin-right: 42px;
      box-shadow: initial !important;

      &.theme--dark {
        background-color: $main.anchor;

        .v-btn__content {
          // padding: 0 12px 0 8px;
          font-size: 12px;
          f-cybex-style('black', medium);
          line-height: 1.33;
          color: $main.grey;
        }

        .add-icon {
          line-height: 1 !important;
          font-size: 1.8em !important;
        }

        .add-label {
          margin-top: 4px;
        }
      }
    }
  }

  .icon-column {
    // line-height: 56px;
    line-height: 56px;
    margin-top: 0;
    margin-bottom: 0;
    min-width: 120px;

    .v-input--checkbox {
      margin-left: 24px !important;
    }
  }

  table.theme--dark.v-table {
    .top-end {
      padding-top: 30px;
      height: 62px;
      box-shadow: inset 0 6px 0 0 #171d2a;
    }

    tbody td:first-child {
      padding: initial;
    }

    label {
      line-height: 56px;
      margin-left: 8px;
    }

    tr, td {
      height: 56px;
      line-height: 56px;
      box-shadow: inset 0 -2px 0 0 rgba(23, 29, 42, 1);
    }

    tr {
      color: rgba($main.white, 0.8);
    }

    tr:hover {
      opacity: 1;
      color: rgba(255, 255, 255, 1);
      background-color: rgba(35, 42, 56, 1) !important;
    }

    thead tr:first-child {
      height: 40px;
      font-size: 12px;
      f-cybex-style(medium);
      line-height: 1.33;
      color: $main.white;
      border-bottom: initial !important;
    }

    td {
      f-cybex-style('heavy', medium);
      font-size: 12px;
      line-height: 1.33;
      height: 56px;
    }

    td a {
      text-decoration: none;
      color: white;
    }

    .v-btn--icon {
      width: 12px;
      margin-left: -12px;
    }

    .v-divider--vertical {
      min-height: 40%;
      max-height: 40%;
    }

    td.op {
      width: 240px;
      padding: 0 !important;

      .op-wrap {
        width: 228px;
        margin-right: 48px;
        display: flex;

        .op-item, .v-tooltip {
          f-cybex-style('black', medium);
          padding: 0 !important;
          display: inline;
          width: 84px !important;
          font-size: 12px !important;
          height: 32px;
          line-height: 32px;
          text-align: center;
          color: cybex-grey !important;

          &.border {
            border-right: solid 0.08em dark;
          }

          &:hover {
            color: $main.lilac !important;

            &, & .v-btn__content {
              background: initial !important;
            }
          }
        }

        .op-item.last {
          max-width: 64px !important;
          text-align: right;
          padding-left: 12px !important;
        }

        .v-tooltip.unopen span.op-item {
          color: white-opacity-30 !important;
        }

        span.op-item.unopen, .v-tooltip.unopen {
          color: white-opacity-30 !important;
          cursor: not-allowed;

          &:hover {
            color: white-opacity-30 !important;
          }
        }
      }
    }
  }

  .v-input--checkbox {
    .v-input__control {
      height: 40px;
    }
  }

  .value-equal {
    // color:grey !important;
    margin-left: -18px;
    font-size: 12px;
    f-cybex-style(medium);
    color: white-opacity-30;
  }
}

.switch-exchange {
  width: 85px;
  margin-top: 12px;

  .theme--dark.v-list {
    border-radius: 4px;
    box-shadow: 0 8px 10px 0 rgba(0, 0, 0, 0.2), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 16px 24px 2px rgba(0, 0, 0, 0.14);
    background-color: #212939;
  }

  .v-list__tile {
    f-cybex-style('black', medium);
    height: 32px !important;
    opacity: 0.8;
    font-size: 12px;
    line-height: 1.33;
    padding: initial;
    color: white;
  }

  .v-list__tile__title {
    text-align: center;
  }
}
</style>
