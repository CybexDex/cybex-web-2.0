<template>
  <div class="lockup">
    <div v-if="islocked" class="desc-wrap">
      <!-- <h4>{{$t('sub_title.browse_locked')}}</h4>
      <p class="mt-1">{{$t('info.lockup')}}</p>-->
      <cybex-btn class="mt-2 text-capitalize" @click="onUnlockClicked">{{ $t('button.unlock_continue') }}</cybex-btn>
    </div>
    <div v-else class="table-wrapper">
      <v-data-table :headers="lockItems" :items="lockDatas" hide-actions :dark="false">
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">
            <div class="coin-wrap ml-4">
              <img
                width="20px"
                :src="iconMap[props.item.balance.asset_id]" 
                class="coin-icon mr-2">
              <span>{{ props.item.balance.asset_id | coinName(coinMap) }}</span>
            </div>
          </td>
          <td class="text-xs-right">{{ props.item.amount | roundDigits(props.item.precision) }}</td>
          <td class="text-xs-right">
            <v-icon :class="props.item.isExpired | expireTimeClass">ic-alarm_white</v-icon>
            <span class="ml-2">{{ props.item.vesting_policy | expiration('DD/MM/YYYY HH:mm:ss') }}</span>
          </td>
          <!-- <td class="text-xs-right"><v-btn v-if="checkClaim(props.item.vesting_policy)" @click="onClaimClicked">{{ $t('button.claim') }}</v-btn></td> -->
        </template>
        <template slot="no-data">
          <h4 class="text-center">{{ $t('info.no_data') }}</h4>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import { orderBy } from "lodash";

export default {
  data() {
    return {
      querystr: "",
      search: "",
      isLoading: false,
      marketDatas: [],
      lockItems: [
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
          text: this.$t("table_title.expiration"),
          value: "expiration",
          align: "right",
          sortable: false
        }
      ],
      items: [],
      lockDatas: []
    };
  },
  computed: {
    ...mapGetters({
      islocked: "auth/islocked",
      iconMap: "user/icons",
      coinMap: "user/coins",
      username: "auth/username"
    })
  },
  async mounted() {
    if (!this.islocked && this.username) {
      await this.getLockedAssets();
    }
  },
  watch: {
    async islocked(newval) {
      if (!newval) {
        await this.getLockedAssets();
      }
    },
    async username(val) {
      if (!this.islocked && val) {
        await this.getLockedAssets();
      }
    }
  },
  filters: {
    expiration(policy, f) {
      return moment(
        moment
          .utc(policy.begin_timestamp)
          .add(policy.vesting_duration_seconds, "seconds")
          .toDate()
      ).format(f);
    },
    expireTimeClass(isExpired) {
      return {
        "expired-asset": isExpired
      };
    }
  },
  methods: {
    async getLockedAssets() {
      try {
        const data = await this.$callmsg(this.cybexjs.queryLocked);
        await Promise.all(
          data.map(async (i, index) => {
            const info = await this.$callmsg(
              this.cybexjs.queryAsset,
              i.balance.asset_id
            );
            i.precision = info.precision;
            i.amount = i.balance.amount / Math.pow(10, info.precision);
            i.expiredDate = moment
              .utc(i.vesting_policy.begin_timestamp)
              .add(i.vesting_policy.vesting_duration_seconds, "seconds");
            i.isExpired = moment() >= i.expiredDate;
          })
        );
        this.lockDatas = orderBy(
          data,
          ["isExpired", "expiredDate"],
          ["desc", "asc"]
        );
      } catch (e) {}
    },
    async onClaimClicked() {},
    async onUnlockClicked() {
      this.$toggleLock();
    }
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';

.lockup {
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
  }

  .table.v-table thead {
    th:first-child {
      padding: 0px !important;
    }
  }

  .v-btn {
    height: 32px;
    border-radius: 4px;
    padding: 0;
    margin: 0;
    background-image: linear-gradient(111deg, #ffc478, #ff9143);

    .v-btn__content {
      font-size: 12px;
      color: white;
      text-transform: capitalize;
    }
  }

  .desc-wrap {
    margin: 0 auto;
    width: 1136px;
    height: 408px;
    padding-top: 80px;
    background-color: #1b2230;
    text-align: center;

    .v-btn {
      padding: 0 8px;
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
}
</style>
