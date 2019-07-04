<template>
  <div class="userasset account">
    <div class="head-line ml-4 mr-5">
      <cybex-text-field
        middle
        no-message
        v-model="querystr"
        clearable
        prepend-inner-icon="ic-search"
        :placeholder="$t('placeholder.search_asset')"
      />
      <v-spacer/>
      <notice-tip class="ml-2" :content="$t('tooltip.create_asset')" :offset="120">
        <template slot="hooker">
          <cybex-btn @click="createAsset" small color="minor">
            <v-icon class="add-icon mr-2">ic-add</v-icon>
            <span class="add-label">{{ $t('button.create_asset') }}</span>
          </cybex-btn>
        </template>
      </notice-tip>
    </div>
    <div class="table-wrapper">
      <v-data-table :headers="assetItems" :items="itemDatas" hide-actions :dark="false">
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">
            <div class="coin-wrap ml-4">
              <div
                class="ic-asset-icon-bg asset-icon-bg"
              >{{ props.item.asset_type | coinName(coinMap) | shorten | shortenContest | firstLetterCoin }}</div>
              <!-- <canvas
                :id="`customPic${coinMap[props.item.asset_type]}`.replace('.', '')"
                width="20"
                height="20"
                class="mr-2 custom-pic"
              />-->
              <asset-pairs :asset-id="props.item.asset_type" :shorten-game="false"/>
            </div>
          </td>
          <td class="text-xs-right">{{ props.item.assetAmount | roundDigits(props.item.precision) }}</td>
          <td class="text-xs-right">
            <div class="mr-4">{{ props.item.frozenBalance | roundDigits(props.item.precision) }}</div>
          </td>
        </template>
        <template slot="no-data">
          <h4 class="text-center">{{ $t('info.no_data') }}</h4>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import moment from "moment";
import utils from "~/components/mixins/utils";
import { filter, cloneDeep } from "lodash";
import config from "~/lib/config/config.js";

export default {
  data() {
    return {
      querystr: "",
      search: "",
      isLoading: false,
      marketDatas: [],
      assetItems: [
        {
          text: this.$t("table_title.coin"),
          value: "coin",
          align: "left",
          sortable: false
        },
        {
          text: this.$t("table_title.amount"),
          value: "amount",
          align: "right",
          sortable: false
        },
        {
          text: this.$t("table_title.frozen"),
          value: "frozen",
          align: "right",
          class: "frozen-tlt",
          sortable: false
        }
      ],
      items: [],
      lockDatas: [],
      userAssets: []
    };
  },
  mixins: [utils],
  components: {
    NoticeTip: () => import("~/components/NoticeTip.vue")
  },
  computed: {
    ...mapGetters({
      islocked: "auth/islocked",
      iconMap: "user/icons",
      coinMap: "user/coins",
      userAssetList: "user/userAssets",
      assets: "user/assets",
      username: "auth/username"
    }),
    itemDatas() {
      const filteredList = filter(this.userAssets, item => {
        const coinname = this.coinMap[item.asset_type] || ''
        let filtered =
          !this.querystr || coinname.indexOf(this.querystr.toUpperCase()) > -1;
        filtered = filtered && item.amount > 0;
        filtered = filtered && !coinname.startsWith("JADE.")
        return filtered;
      });
      return filteredList;
    }
  },
  watch: {
    async username(val){
      if (!val) {return;}
      setTimeout(this.setupUserAssets, 450);
    }
  },
  methods: {
    async setupUserAssets() {
      const list = cloneDeep(
        filter(
          this.userAssetList,
          i => this.assets.findIndex(j => j.asset_type === i.asset_type) === -1
        )
      );
      await Promise.all(
        list.map(async i => {
          const data = await this.cybexjs.queryAsset(i.asset_type);
          i.precision = data.precision;
          i.assetAmount = await this.$callmsg(
            this.cybexjs.assetAmount,
            i.asset_type,
            i.amount
          );

          const frozen = await this.$callmsg(
            this.cybexjs.frozenBalances,
            this.username,
            i.asset_type
          );
          if (frozen && frozen != 0) {
            const val = await this.$callmsg(
              this.cybexjs.assetAmount,
              i.asset_type,
              frozen.balance
            );
            let v = parseFloat(val);
            i.frozenBalance = v;
          } else {
            i.frozenBalance = 0;
          }
        })
      );
      this.userAssets = list;
    },
    createAsset() {
      window.open(
        `${config.links.oldSite}/account/${this.username}/create-asset/`
      );
    }
  },
  async mounted() {
    setTimeout(this.setupUserAssets, 450);
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.userasset.account {
  background: $main.lead !important;
  border-radius: 4px;

  .frozen-tlt {
    padding-right: 48px !important;
  }

  table.v-table.theme--dark {
    td .op-item {
      margin-right: 24px;
      color: $main.grey !important;

      &.unopen {
        color: rgba($main.white, 0.3) !important;
      }
    }
  }

  .head-line {
    height: 56px;
    display: flex;
    align-items: center;

    .v-text-field {
      width: 384px;
      max-width: 384px;
    }

    .create-btn.v-btn {
      // width: 129px;
      height: 31px;
      border-radius: 4px;
      // padding: 0 !important;
      padding: 0 16px !important;
      float: right;
      margin-right: 38px;
      box-shadow: initial !important;

      &.theme--dark {
        background: #212939;

        .v-btn__content {
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

  .custom-pic {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    margin-left: 2px;
  }

  .v-icon {
    &.expired-asset::before {
      color: orange !important;
    }

    line-height: 16px;
    font-size: 20px !important;
  }

  .coin-wrap {
    display: flex;
    align-items: center;

    span {
      line-height: 1.71;
      padding-top: 2px;
    }
  }
}

.desc-wrapper {
  margin: 0 auto;
  width: 1136px;
  height: 408px;
  padding-top: 80px;
  background-color: #1b2230;
  text-align: center;

  .v-btn {
    width: 165px;
  }
}

.table-wrapper {
  margin: 0 auto;

  // width: 1112px;
  tr {
    height: 56px;
  }

  .v-btn {
    width: 75px;
  }
}
</style>
