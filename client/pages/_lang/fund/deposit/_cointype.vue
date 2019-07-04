<template>
  <div class="deposit">
    <!-- memo -->
    <v-flex xs12 v-if="needShowMemo">
      <h3 class="mb-5">{{ `${coinname} ${$t('sub_title.deposit_addr')}` }}</h3>
      <template v-if="!islocked">
        <div class="address">
          <cybex-text-field
            class="input-text"
            v-model="address"
            readonly
            :copy-icon="'ic-copy'"
            :copy-icon-cb="onCopied"
            middle
          />
        </div>
        <h3 class="mt-4 mb-2">{{ $t('sub_title.verify_code') }}</h3>
        <div class="eos-notice">
          <div>{{ $t('info.eos_notice', {coinname}) }}</div>
        </div>
        <div class="address">
          <cybex-text-field
            middle
            :value="memo"
            :copy-icon="'ic-copy'"
            :copy-icon-cb="onCopied"
            class="input-text"
            readonly
          />
        </div>
      </template>
      <div v-else class="text-center unlock-tip"><strong>{{ $t('info.unlock_to_deposit') }}</strong></div>
    </v-flex>
    <!-- no memo -->
    <v-flex xs12 v-else>
      <h3>{{ `${coinname} ${$t('sub_title.deposit_addr')}` }}</h3>
      <div class="address text-center" v-if="assetInfo && assetInfo.depositSwitch">
        <template v-if="!islocked">
          <canvas id="qrcode" width="310" height="310"/>
          <cybex-text-field
            middle
            :copy-icon="'ic-copy not-narrow'"
            :copy-icon-cb="onCopied"
            class="input-text"
            v-model="address"
            readonly
          />
        </template>
        <div v-else class="text-center unlock-tip"><strong>{{ $t('info.unlock_to_deposit') }}</strong></div>
      </div>
      <p class="forbid-info" v-else>{{ assetInfo ? assetInfo[`${localeShort}Msg`] : '' }}</p>
    </v-flex>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import clipboard from "clipboard-polyfill";
import QRCode from "qrcode";

export default {
  async asyncData({ params, store }) {
    store.commit("UPDATE_DW_COINTYPE", params.cointype);
    return {
      cointype: params.cointype || ""
    };
  },
  layout: "transfer",
  head() {
    return {
      title: this.$t("title.deposit")
    };
  },
  data() {
    return {
      address: "",
      message: "",
      memo: ""
    };
  },
  components: {
    TransferSelector: () => import("~/components/TransferSelector.vue")
  },
  computed: {
    ...mapGetters({
      username: "auth/username",
      coinsInvert: "user/coinsInvert",
      localeShort: "i18n/shortcut",
      assetConfig: 'user/assetConfigBySymbol',
      islocked: "auth/islocked"
    }),
    needShowMemo() {
      return this.assetInfo.useMemo
    },
    assetInfo() {
      return this.assetConfig[this.cointype] || {}
    },
    coinname () {
      return this.assetInfo.name
    }
  },
  methods: {
    async refreshAddress(cointype) {
      // try {
        const coinname = cointype ? (this.assetConfig[cointype] || {}).name : this.coinname
        const address = await this.cybexjs.gateway.user_address(this.username, coinname)
        if (this.needShowMemo) {
          const [ addr, memo ] = address.replace("]", "").split("[")
          this.address = addr
          this.memo = memo
        } else {
          this.address = address
          const canvasElem = document.getElementById("qrcode")
          if (canvasElem) {
            QRCode.toCanvas(
              canvasElem,
              address,
              {
                margin: 1,
                width: 310
              },
              function(error) {
                if (error) console.error(error)
              }
            )
          }
        }
      // } catch (e) { console.log(e) }
    },
    onCopied(item) {
      clipboard.writeText(item);
      this.$message({
        message: this.$t("message.copied")
      });
    }
  },
  watch: {
    async username(val) {
      if (!val) return;
      if (!this.islocked) {
        await this.refreshAddress();
      }
    },
    $route: async function(route) {
      if (!this.islocked) {
        await this.refreshAddress(route.params.cointype);
      }
    },
    async islocked (newval) {
      if (!newval) {
        await this.refreshAddress();
      }
    }
  },
  async mounted() {
    if (!this.islocked) {
      await this.refreshAddress();
    }
  }
};
</script>


<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.transfer {
  .content-wrap {
    background: $main.lead;
    display: flex;
    align-items: center;

    .content-detail {
      width: 497px;
    }
  }

  .deposit {
    padding: 7px 32px;

    .unlock-tip {
      padding: 100px 20px;
    }

    h3 {
      font-size: 14px;
      f-cybex-style('black', medium);
    }

    .forbid-info {
      margin-top: 100px;
      margin-bottom: 80px;
      text-align: center;
      color: orange;
    }

    .eos-notice {
      word-break: break-word;
      width: 100%;
      min-width: 422px;
      font-size: 13px;
      line-height: 20px;
      color: rgba($main.orange, 0.8);
      position: relative;
      &:after {
        background-color: rgba(255,145,67,0.5);
        content: '';
        height: 70%;
        width: 2px;
        position: absolute;
        left: 0;
        top: 15%;
      }
      padding-left: 19px;
      margin: 0 0 32px 11px;
      // f-cybex-style(medium);
    }

    .v-text-field {
      &.middle-size {
        .v-input__slot {
          height: 48px;
        }
      }
    }

    #qrcode {
      margin: 49px auto 32px;
      width: 155px !important;
      height: 155px !important;
    }

    .v-snack--bottom {
      bottom: 50%;
    }

    .v-snack__content {
      display: initial;
      justify-content: initial;
      text-align: center;
      width: 377px !important;
      height: 80px !important;
      color: cybex-red;
      font-size: 14px;
      f-cybex-style('black', medium);
      box-shadow: 0 8px 10px 0 rgba(0, 0, 0, 0.2), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 16px 24px 2px rgba(0, 0, 0, 0.14);
      background-color: #212939;
      line-height: 80px;
      padding: initial;

      .v-icon {
        font-size: 1.8em;
        line-height: 14px;
        margin-right: 8px;
        color: cybex-red;
      }
    }

    .address {

      .container {
        padding: 0;
      }

      .flex {
        height: 40px;
        line-height: 40px;
      }

      .address-wrap {
        height: 56px;
        line-height: 56px;
        box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.5);

        p {
          font-size: 14px;
          f-cybex-style(medium);
          line-height: 1.43;
        }
      }
    }
  }
}
</style>
