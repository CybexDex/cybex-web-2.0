<template>
  <div class="account">
    <v-layout row wrap class="title-line mb-2">
      <div class="left-tlt">
        <span>{{ $t('sub_title.hello') }},</span>
        <h1 class="whole-name-tip" :title="username">
          {{ username }}
          <span v-if="userId" class="userinfo-id">{{ 'ID: ' + userId }}</span>
        </h1>
        <div class="coin-age">
          {{ $t('sub_title.coin_age') }}: {{ coinAge }}
          <v-tooltip
            content-class="coin-age-tooltip"
            :nudge-right="190"
            right
            bottom
            :max-width="353"
            :min-width="323"
            allow-overflow
          >
            <template slot="activator">
              <v-icon size="14" class="notice-icon ml-1">ic-help</v-icon>
            </template>
            <div class="mb-1">{{ $t('tooltip.coin_age_desc') }}</div>
            <div class="l-title mt-3">{{ $t('tooltip.coin_age_rule') }}</div>
            <div
              v-for="(item, idx) of [{id: 'age0', val: 0}, {id: 'age1', val: 1}, {id: 'age2', val: 2}, {id: 'age3', val: 3}]"
              :key="`${idx}-${item.id}`"
              v-html="$t('tooltip.coin_age_rule_content' + item.val)"
            />
            <div class="l-title mt-3">{{ $t('tooltip.coin_age_note') }}</div>
            <div
              v-for="(item, idx) of [{id: 'note0', val: 0}, {id: 'note1', val: 1}]"
              :key="`${idx}-${item.id}`"
              v-html="$t('tooltip.coin_age_note_content' + item.val) "
            />
            <div class="l-title mt-3">{{ $t('tooltip.coin_age_example') }}</div>
            <div
              v-for="(item, idx) of [{id: 'exp0', val: 0}, {id: 'exp1', val: 1}, {id: 'exp2', val: 2}]"
              :key="`${idx}-${item.id}`"
              v-html="$t('tooltip.coin_age_example_content' + item.val)"
            />
          </v-tooltip>
        </div>
      </div>
      <v-spacer/>
      <v-layout row wrap class="right-column">
        <v-flex xs6 offset-xs1>
          <v-spacer/>
          <div class="text-right balance pr-5">
            <span class="b-label">{{ $t('sub_title.cur_balance') }}</span>
            <notice-tip slot="append" :content="$t('tooltip.balance_all')" :offset="120"/>
            <h2>{{ total.balance | floorDigits(5) }} CYB</h2>
            <p class="in-cny mt-1">≈{{ total.value | legalDigits(symbol) }}</p>
          </div>
        </v-flex>
        <v-flex xs5>
          <div class="right-nav">
            <v-layout row wrap>
              <v-flex xs6>
                <v-card
                  dark
                  @click.native="jumpTo(`/fund/transfer/CYB`)"
                  class="jump-btn transfer-btn"
                >
                  <v-icon>ic-send</v-icon>
                  <h3>{{ $t('button.transfer') }}</h3>
                </v-card>
              </v-flex>
              <v-flex xs6>
                <v-card dark @click.native="jumpTo('/fund/history')" class="jump-btn">
                  <v-icon>ic-records</v-icon>
                  <h3>{{ $t('button.history') }}</h3>
                </v-card>
              </v-flex>
            </v-layout>
          </div>
        </v-flex>
      </v-layout>
    </v-layout>
    <br>
    <v-layout row wrap>
      <v-flex xs12>
        <v-tabs v-model="activeTab" color="#1b2230" dark slider-color="#ff9143">
          <v-tab v-for="(tab, index) in tabItems" :key="index" ripple>{{ tab }}</v-tab>
          <v-tab-item>
            <asset-list/>
          </v-tab-item>
          <v-tab-item>
            <user-asset-list/>
          </v-tab-item>
          <v-tab-item>
            <lockup-list/>
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { keys } from "lodash";
import { g } from "~/lib/cybex_help";
import { mapGetters, mapActions } from "vuex";
import utils from "~/components/mixins/utils";

export default {
  components: {
    NoticeTip: () => import("~/components/NoticeTip.vue"),
    AssetList: () => import("~/components/AssetList.vue"),
    LockupList: () => import("~/components/LockupList.vue"),
    UserAssetList: () => import("~/components/UserAssetList.vue")
  },
  head() {
    return {
      title: this.$t("title.portfolio")
    };
  },
  mixins: [utils],
  data() {
    return {
      coinAge: null,
      tabs: [
        {
          label: this.$t("tab_label.portfolio"),
          path: "portfolio"
        },
        {
          label: this.$t("tab_label.userasset"),
          path: "userasset"
        },
        {
          label: this.$t("tab_label.lockup"),
          path: "lockup"
        }
      ]
    };
  },
  layout: "transfer",
  computed: {
    ...mapGetters({
      username: "auth/username",
      total: "user/total",
      symbol: "i18n/symbol",
      locale: "i18n/locale",
      tab: "user/assetTab",
      defaultAsset: "exchange/defaultAsset",
      userId: "auth/userId"
    }),
    tabItems() {
      return this.tabs.map(tab => tab.label);
    },
    curFundType() {
      return this.tabs[this.activeTab].path;
    },
    activeTab: {
      get() {
        return this.tab;
      },
      set(value) {
        this.$store.commit("user/UPDATE_ASSET_TAB", {
          username: this.username,
          tab: value
        });
      }
    }
  },
  watch: {
    async username(val) {
      if (val) {
        this.coinAge = null;
        rawlog("username changed", val);
        this.coinAge = await this.cybexjs.cybAgeHttp(val);
      }
    }
  },
  async mounted() {
    if (!this.userId) {
      await this.$store.dispatch("auth/getUserId");
    }
    if (!this.coinAge && this.username) {
      this.coinAge = await this.cybexjs.cybAgeHttp(this.username);
    }
    if (this.username) {
      await this.$store.dispatch("user/loadAssetTab", this.username);
    }
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.whole-name-tip {
  width: 420px !important;

  .userinfo-id {
    padding: 3px 8px 5px;
    margin-left: 4px;
    min-width: 65px;
    color: $main.grey;
    height: 20px;
    border-radius: 4px;
    background-image: linear-gradient(285deg, rgba($main.grey, 0.1), rgba($main.grey, 0.3));
    display: inline-block;
    line-height: 16px;
    position: relative;
    top: -4px;
  }
}

.coin-age {
  color: $main.grey;
  font-size: 12px;
  margin-top: 8px;
}

.coin-age-tooltip {
  padding: 16px;
  background-color: rgba(17, 22, 33, 0.92);
  border-radius: 4px;
  color: rgba($main.white, 0.8);
  line-height: 1.5;
  font-size: 12px;

  .l-title {
    color: $main.orange;
  }
}

.right-nav {
  margin-left: 24px;

  .flex {
    padding-left: 2px;
  }

  .jump-btn {
    padding: 10px 15px;
    width: 100%;
    min-height: 64px;
    font-size: 12px;
    f-cybex-style('black', medium);
    line-height: 1.33;
    text-decoration: none;
    margin-right: 24px;
    cursor: pointer;
    box-shadow: 0 8px 8px -4px rgba(0, 0, 0, 0.04);
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.04);

    &.transfer-btn {
      right: 8px;
    }

    h3 {
      color: $main.grey;
    }

    &:hover {
      background-color: #3b4250 !important;
    }

    .v-icon {
      font-size: 1.5em !important;
    }
  }
}

.title-line {
  height: 96px;
  padding-top: 25px;

  .left-tlt h1 {
    width: 410px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1, h2, h3 {
    margin-top: 5px;
  }

  h1 {
    font-size: 24px;
    f-cybex-style('black');
  }

  span {
    font-size: 12px;
    f-cybex-style(medium);
  }
}

.account {
  margin: 0 auto;

  .v-tabs__item {
    f-cybex-style(heavy);
  }

  &, &>.layout {
    width: 1136px !important;
  }

  .right-column {
    max-width: 640px;
  }

  .balance {
    width: 340px;

    .b-label {
      font-size: 12px;
      f-cybex-style(medium);
      line-height: 1.33;
      opacity: 0.3;
    }

    h2 {
      font-size: 16px;
      f-cybex-style('black', medium);
      line-height: 1.5;
      color: white;
      opacity: 1;
    }

    .in-cny {
      font-size: 14px;
      f-cybex-style(medium);
      line-height: 1.14;
      color: $main.grey;
    }
  }

  .v-tabs__wrapper {
    background: #171d2a;
    margin-bottom: 24px;
  }
}
</style>

