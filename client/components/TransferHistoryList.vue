<template>
  <div class="transfer-history-list">
    <v-toolbar class="data-table-toolbar" height="40">
      <label class="label-input">{{ $t('form_label.asset') }}</label>
      <div class="select-wrap ml-2 mr-4">
        <v-autocomplete
          class="small-size"
          dark
          :items.sync="usedAssetType"
          :append-icon="'ic-arrow_drop_down'"
          v-model="asset"
          cache-items
          flat
          hide-no-data
          hide-details
          @change="onFilterChanged"
          solo
          :menu-props="{'offset-y': true, 'max-width': 120, 'nudgeBottom': 6, 'contentClass': 'ps-dropdown-asset'}"
        >
          <span slot="item" slot-scope="{ item }" :title="item.text">{{ item.text }}</span>
        </v-autocomplete>
      </div>
      <label class="label-input">{{ $t('form_label.type') }}</label>
      <div class="select-wrap ml-2">
        <v-select
          class="small-size"
          :menu-props="{'offset-y': true, 'max-width': 120, 'nudgeBottom': 6}"
          v-model="transferType"
          :items="types"
          @change="onFilterChanged"
          solo
        >
          <template slot="selection" slot-scope="{ item }">
            <div class="full-width">
              <template v-if="item">{{ $t(`info.${item.toLowerCase()}`) }}</template>
              <template v-else>{{ $t('selection.all') }}</template>
            </div>
          </template>
          <div slot="item" slot-scope="{ item }" class="selection">
            <template v-if="item">{{ $t(`info.${item.toLowerCase()}`) }}</template>
            <template v-else>{{ $t('selection.all') }}</template>
          </div>
        </v-select>
      </div>
    </v-toolbar>
    <v-data-table
      :headers="historyHeaders"
      :items="itemDatas"
      :loading="!history"
      item-key="time"
      hide-actions
      class="transparent-bg middle-size-table"
    >
      <template slot="headerCell" slot-scope="props">
        <span class="table-tlt">{{ props.header.text }}</span>
      </template>
      <template slot="items" slot-scope="props">
        <tr :class="{ 'expand-row' : props.expanded }">
          <td class="text-xs-center">
            <v-icon>{{ `ic-${props.item.type === 'send' ? 'outcome' : 'income'}` }}</v-icon>
          </td>
          <td class="text-xs-left">{{ props.item.time | date('DD/MM/YYYY HH:mm:ss') }}</td>
          <td
            class="text-xs-right"
          >{{ props.item.type === 'send' ? '-' : '+' }}&nbsp;{{ (props.item.amount / Math.pow(10, props.item.precision)) | floorDigits(props.item.precision) }} <asset-pairs :asset-id="props.item.asset" /></td>
          <td class="text-xs-right"><div class="acct-name" :title="props.item.to_name">{{ props.item.to_name }}</div></td>
          <td class="text-xs-right"><div class="acct-name" :title="props.item.from_name">{{ props.item.from_name }}</div></td>
          <td class="text-xs-right">
            <template
              v-if="props.item.expiration"
            >{{ props.item.expiration | date('DD/MM/YYYY HH:mm:ss') }}</template>
          </td>
          <td class="text-xs-right">
            <a
              v-if="props.item.memo"
              class="explorer-link"
              @click="props.expanded = !props.expanded"
            >{{ $t('button.view_detail') }}</a>
            <template v-else>-</template>
          </td>
        </tr>
      </template>
      <template slot="no-data">
        <h4 class="margin-auto">{{ $t('info.no_data') }}</h4>
      </template>
      <template slot="expand" slot-scope="props">
        <div
          :class="{'margin-auto': islocked || !memokey || memokey === 'empty' || memoList[props.index] === null }"
        >
          <template v-if="islocked">
            <cybex-btn tiny class="unlock-btn" @click="$toggleLock()">{{ $t('button.unlock') }}</cybex-btn>
          </template>
          <template v-else>
            <div v-if="memokey && memokey!=='empty' && memoList[props.index] !== null">
              <span class="c-white-30 mr-1">Memo:</span>
              {{ memoList[props.index] }}
            </div>
            <p v-else>{{ $t('info.invalid_memokey') }}</p>
          </template>
        </div>
      </template>
    </v-data-table>
    <v-toolbar v-if="total" class="data-table-toolbar pagination">
      <!-- <label class="label-input">Page</label> -->
      <v-pagination v-model="page" :length="pageNum" :total-visible="10" @input="onPageChanged"/>
      <v-spacer/>
      <label class="page-count-label">{{ pageLabel }}</label>
    </v-toolbar>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import moment from "moment";
import config from "~/lib/config/config.js";
import PerfectScrollbar from "perfect-scrollbar";
import { map, filter, cloneDeep } from "lodash";
import utils from "~/components/mixins/utils";

export default {
  data() {
    return {
      transferType: null,
      asset: null,
      page: 1,
      offset: 0,
      total: 20,
      size: 10,
      history: null,
      historyHeaders: [
        {
          text: this.$t("table_title.type"),
          value: "type",
          align: "center",
          sortable: false
        },
        {
          text: this.$t("table_title.time"),
          value: "time",
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
          text: this.$t("table_title.transfer_in"),
          value: "to",
          align: "right",
          sortable: false,
          class: 'acct-name'
        },
        {
          text: this.$t("table_title.transfer_out"),
          value: "from",
          align: "right",
          sortable: false,
          class: 'acct-name'
        },
        {
          text: this.$t("table_title.expiration"),
          value: "vesting_period",
          align: "right",
          sortable: false
        },
        {
          text: this.$t("table_title.memo"),
          value: "memo",
          align: "right",
          sortable: false
        }
      ],
      types: [null, "send", "receive"],
      memoList: {}
    };
  },
  mixins: [utils],
  computed: {
    ...mapGetters({
      username: "auth/username",
      coinMap: "user/coins",
      userAssets: "user/userAssets",
      assets: "user/assets",
      memokey: "user/memokey",
      islocked: "auth/islocked"
    }),
    itemDatas() {
      return this.history || [];
    },
    pageLabel() {
      const start = Math.min((this.page - 1) * this.size + 1, this.total);
      const end = Math.min(this.total, this.page * this.size);
      return this.$t("label.pagination", { start, end, total: this.total });
    },
    pageNum() {
      return Math.ceil(this.total / this.size);
    },
    usedAssets() {
      return (
        cloneDeep(
          filter(
            this.userAssets,
            i =>
              this.assets.findIndex(j => j.asset_type === i.asset_type) === -1
          ).concat(this.assets)
        ) || []
      );
    },
    usedAssetType() {
      const arr = map(this.usedAssets, v => {
        return {
          parent: null,
          value: v ? v.asset_type : '',
          text: v ? this.coinName(v.asset_type, this.coinMap) : ''
        };
      });
      arr.unshift({
        value: null,
        parent: "",
        text: this.$t("selection.all")
      });
      return arr;
    }
  },
  methods: {
    loadUsedAssets() {
      setTimeout(() => {
        const ps = new PerfectScrollbar(".ps-dropdown-asset", {
          wheelPropogation: false
        });
        if (ps) ps.update();
      }, 200);
    },
    async onFilterChanged() {
      try {
        await this.loadHistory();
      } catch (e) {}
    },
    async initLoad() {
      this.offset = 0;
      this.page = 1;
      this.total = 20;
      try {
        await this.loadHistory();
      } catch (e) {}
    },
    async loadHistory() {
      this.history = null;
      this.memoList = {};
      const [data, total] = await this.$callmsg(
        this.cybexjs.transfer_history,
        this.username,
        this.asset,
        this.transferType,
        this.page - 1,
        this.size
      );
      await Promise.all(
        (data || []).map(async (i, index) => {
          const info = await this.$call(this.cybexjs.queryAsset, i.asset);
          i.precision = info.precision;
          const to = await this.$call(this.cybexjs.get_user, i.to);
          const from = await this.$call(this.cybexjs.get_user, i.from);
          if (
            !this.islocked &&
            this.memokey &&
            this.memokey !== "empty" &&
            i.memo
          ) {
            try {
              const memo = await this.cybexjs.userReadMemo(i.memo);
              this.$set(this.memoList, index, memo);
            } catch (e) {
              this.$set(this.memoList, index, null);
            }
          }
          i.to_name = to.account.name;
          i.from_name = from.account.name;
          if (i.vesting_period) {
            i.expiration = moment
              .utc(i.time)
              .add(i.vesting_period.vesting_period, "seconds")
              .toDate();
          }
        })
      );
      this.history = data || [];
      // this.page = Math.floor(data.offset / this.size) + 1
      this.total = total || 0;
    },
    async onPageChanged() {
      try {
        await this.loadHistory();
      } catch (e) {}
    },
    async decryptMemo() {
      if (this.islocked) return;
      await Promise.all(
        map(this.history, async (i, index) => {
          if (i.memo) {
            try {
              const memo = await this.cybexjs.userReadMemo(i.memo);
              this.$set(this.memoList, index, memo);
            } catch (e) {
              this.$set(this.memoList, index, null);
            }
          }
        })
      );
    }
  },
  watch: {
    memokey(newval) {
      if (newval && newval !== "empty") {
        this.decryptMemo();
      }
    },
    async username(val){
      if (!val) { return; }
      await this.initLoad();
      this.loadUsedAssets();
    }
  },
  async mounted() {
    await this.initLoad();
    this.loadUsedAssets();
  }
};
</script>