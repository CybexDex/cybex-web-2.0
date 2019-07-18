<template>
  <div>
    <div>
      <v-data-table
        :headers="headers"
        class="large-size-table"
        :items="computedRows"
        hide-actions
        :dark="false"
        :sort-icon="'ic-arrow_up'"
        :loading="loading"
      >
        <template slot="items" slot-scope="props">
          <tr :class="{ 'expand-row' : props.expanded }">
            <td class="text-xs-left">
              <div class="coin-icon-wrap d-flex">
                <v-img :src="iconMap[props.item.asset_id]" class="coin-icon ml-4" />
                {{ props.item.asset_id | coinName(coinMap) }}
              </div>
            </td>
            <td class="text-xs-left">{{ props.item.amount | roundDigits(props.item.digits) }}</td>
            <td class="text-xs-left">{{ props.item.from }}</td>
            <td class="text-xs-left">{{ props.item.to }}</td>
            <td class="text-xs-left">{{ props.item.expired_time | date('DD/MM/YYYY HH:mm:ss') }}</td>
            <td class="text-xs-left">{{ props.item.hash_type | hashName }}</td>
            <td class="text-xs-left">
              <div class="text-break-all cursor-pointer" @click="props.expanded = !props.expanded">{{ 'detail' }}</div>
            </td>
          </tr>
        </template>
        <template slot="expand" slot-scope="props">
          <div class="expand-hash">
            {{ props.item.hash }}
          </div>
        </template>
        <template slot="no-data">
          <h4 class="text-center pa-10">{{ $t('info.no_data') }}</h4>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { get } from "lodash";
export default {
  computed: {
    ...mapGetters({
      username: "auth/username",
      coinMap: "user/coins",
      iconMap: "user/icons"
    }),
    computedRows() {
      return this.rows ? this.rows : [];
    }
  },
  data() {
    return {
      loading: true,
      rows: [],
      headers: [
        {
          text: this.$t("table_title.coin"),
          class: "pl-4",
          value: "asset_name",
          align: "left",
          sortable: true,
          descending: true
        },
        {
          text: this.$t("table_title.amount"),
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("table_title.from"),
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("table_title.to"),
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("table_title.end_lock"),
          sortable: false,
          align: "left"
        },
        {
          text: this.$t("table_title.hash_type"),
          align: "left",
          sortable: false
        },
        {
          text: this.$t("table_title.hash"),
          sortable: false,
          align: "left"
        }
      ]
    };
  },
  filters: {
    hashName: function(value) {
      let arr = ["ripemd160", "sha1", "sha256"];
      return arr[value] ? arr[value] : "";
    }
  },
  async created() {
    let rows = await this.cybexjs.hashLockedAssets(this.username);
    rows = rows
      ? rows.map(async item => {
          let fromUser = get(item, ["transfer", "from"], "");
          if (fromUser) {
            fromUser = await this.cybexjs.get_user(fromUser);
            fromUser = fromUser.account.name;
          }
          let toUser = get(item, ["transfer", "to"], "");
          if (toUser) {
            toUser = await this.cybexjs.get_user(toUser);
            toUser = toUser.account.name;
          }
          let amount = get(item, ["transfer", "amount"], "");
          let assetId = get(item, ["transfer", "asset_id"], "");
          let digits, assetName;
          let assetInfo = await this.cybexjs.queryAsset(assetId);
          if (assetInfo) {
            digits = assetInfo.precision;
            assetName = assetInfo.symbol;
            amount = parseFloat((amount / Math.pow(10, digits)));
          }
          return {
            id: get(item, "id", ""),
            asset_id: assetId,
            asset_name: assetName,
            digits: digits,
            amount: amount,
            from: fromUser,
            to: toUser,
            hash_type: get(item, ["conditions", "hash_lock", "preimage_hash", "0"], ""),
            hash: get(item, ["conditions", "hash_lock", "preimage_hash", "1"], ""),
            expired_time: get(
              item,
              ["conditions", "time_lock", "expiration"],
              null
            )
          };
        })
      : [];
    Promise.all(rows)
      .then(res => {
        this.rows = res;
      })
      .finally(() => {
        this.loading = false;
      });
  }
};
</script>
<style lang="stylus" scoped>
.expand-hash {
  text-align:center;
  padding: 20px;
}
</style>
