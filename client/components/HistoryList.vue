<template>
  <div class="transparent-bg middle-size-table">
    <v-data-table
      :headers="tbItems"
      :items="itemDatas"
      :loading="isLoading"
      hide-actions
      :dark="false"
    >
      <template slot="headerCell" slot-scope="props">
        <span class="table-tlt">{{ props.header.text }}</span>
      </template>
      <template slot="items" slot-scope="props">
        <tr>
          <td class="text-xs-left">
            <span>{{ props.item.asset | shorten }}</span>
          </td>
          <td class="text-xs-left">{{ $t(`button.${props.item.fundType.toLowerCase()}`) }}</td>
          <td
            class="text-xs-right"
          >{{ (props.item.amount / Math.pow(10, props.item.precision)) | floorDigits(6) }}</td>
          <td class="text-xs-left">{{ props.item.address }}</td>
          <td class="text-xs-left">
            <span style="text-transform: capitalize;">{{ $t(`info.${props.item.state}`) }}</span>
          </td>
          <td class="text-xs-right">{{ props.item.updateAt | date('DD/MM/YYYY HH:mm:ss') }}</td>
          <td class="text-xs-right">
            <a
              class="explorer-link"
              v-if="props.item.link"
              @click="open(props.item.link)"
            >{{ $t('button.view_detail') }}</a>
          </td>
        </tr>
      </template>
      <template slot="no-data">
        <h4 class="text-center">{{ $t('info.no_data') }}</h4>
      </template>
    </v-data-table>
    <v-toolbar class="data-table-toolbar pagination" v-if="total">
      <!-- <label class="label-input">Page</label> -->
      <v-pagination v-model="page" :length="pageNum" :total-visible="10" @input="onPageChanged"/>
      <v-spacer/>
      <label class="page-count-label">{{ pageLabel }}</label>
    </v-toolbar>
  </div>
</template>

<script>
import moment from "moment";
import config from "~/lib/config/config.js";
import { mapGetters } from "vuex";

export default {
  props: {
    fundtype: {
      type: String,
      default: ""
    },
    asset: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      page: 1,
      offset: 0,
      total: 0,
      size: 10,
      isLoading: false,
      history: null,
      tbItems: [
        {
          text: this.$t("table_title.asset"),
          value: "asset",
          align: "left",
          sortable: false
        },
        {
          text: this.$t("table_title.type"),
          value: "fundType",
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
          text: this.$t("table_title.address"),
          value: "address",
          align: "left",
          class: "addr-col",
          sortable: false
        },
        {
          text: this.$t("table_title.status"),
          value: "state",
          align: "left",
          sortable: false
        },
        {
          text: this.$t("table_title.time"),
          value: "updateAt",
          align: "right",
          sortable: false
        },
        {
          text: this.$t("table_title.operation"),
          value: "balance",
          align: "right",
          sortable: false
        }
      ]
    };
  },
  computed: {
    ...mapGetters({
      username: "auth/username"
    }),
    itemDatas() {
      return this.history || [];
    },
    pageLabel() {
      const start = Math.min(this.offset + 1, this.total);
      const end = Math.min(this.total, this.page * this.size);
      return this.$t("label.pagination", { start, end, total: this.total });
    },
    pageNum() {
      return Math.ceil(this.total / this.size);
    }
  },
  watch: {
    async islocked(newval, oldval) {
      if (!newval && oldval) {
        await this.initLoad();
      }
    },
    async fundtype(newval, oldval) {
      if (newval !== oldval) {
        await this.initLoad();
      }
    },
    async asset(newval, oldval) {
      if (newval !== oldval) {
        await this.initLoad();
      }
    },
    async username(val) {
      if (!val) {
        return;
      }
      await this.initLoad();
    }
  },
  // filters: {
  //   state (item) {
  //     const lastDetail = item.details ? item.details[item.details.length - 1] : null
  //     return lastDetail ? lastDetail.state : item.state
  //   }
  // },
  methods: {
    async initLoad() {
      if (!this.islocked) {
        this.offset = 0;
        this.page = 1;
        this.total = 0;
        await this.loadHistory();
      }
    },
    getExplorerLink(data) {
      const last = data.details[data.details.length - 1];
      return last.hash
        ? (data.projectInfo.txExplorer || "").replace("#{txid}", last.hash)
        : "";
    },
    async loadHistory() {
      this.history = null;
      this.isLoading = true;
      this.$eventHandle(
        async () => {
          const data = await this.cybexjs.gatewayRecord(
            (this.page - 1) * this.size,
            this.size,
            (this.fundtype || "").toUpperCase(),
            this.asset
          );
          if (data) {
            // TO DO 静态缓存precision
            await Promise.all(
              data.records.map(async i => {
                const data = await this.cybexjs.queryAsset(i.asset);
                i.precision = data.precision;
                const link = this.getExplorerLink(i);
                i.link = link;
              })
            );
          }
          // rawlog('==== loadHistory: ', data) 
          return data;
        },
        [],
        { user: true }
      ).then(data => {
        this.history = data.records;
        this.offset = data.offset;
        this.page = Math.floor(data.offset / this.size) + 1;
        this.total = data.total;
      }).catch(e => {
        console.error(e);
        this.history = null;
      }).finally(() => {
        this.isLoading = false;
      });
    },
    async onPageChanged() {
      this.offset = (this.page - 1) * this.size;
      await this.loadHistory();
    },
    open(url) {
      window.open(url);
    }
  },
  async mounted() {
    await this.initLoad();
  }
};
</script>