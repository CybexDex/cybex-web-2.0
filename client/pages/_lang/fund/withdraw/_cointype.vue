<template>
  <v-layout row wrap class="transfer-form-wrapper">
    <template v-if="withInfo && withInfo.enable">
      <v-form ref="form">
        <v-flex xs12 class="form-field">
          <cybex-text-field
            no-message
            :label="$t('form_label.withdraw_addr')"
            v-model="address"
            middle
            :placeholder="$t('placeholder.enter_address')"
            clearable
            @input="onAddressChanged"
          >
            <span slot="append-label">
              <v-icon size="16" class="mr-2">ic-balance_wallet</v-icon>
              {{ balance | roundDigits(precision) }} {{ coinname }}
            </span>
            <!-- <div
                slot="append" 
                bottom>
                <v-menu>
                  <div
                    slot="activator"
                    class="input-address">
                    <v-icon>fa-map-marker-alt</v-icon>
                    <span>{{ $t('button.address') }}</span>
                  </div>
                  <v-list>
                    <v-list-tile
                      v-for="(addr, index) in addrs"
                      :key="index"
                      @click="selectAddress(addr)">
                      <v-list-tile-title>{{ addr }}</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
            </div>-->
          </cybex-text-field>
          <p
            class="error-msg"
          >{{ !isAddressValid && addressChecked ? $t('validation.invalid_address', { cointype: coinname }) : ''}}</p>
        </v-flex>
        <v-flex xs12 v-if="needShowMemo" class="form-field">
          <cybex-text-field
            no-message
            middle
            v-model="memo"
            clearable
            @input="onMemoChanged"
          >
            <div slot="label" class="fixed-label">
              {{ $t('form_label.memo') }}
              <notice-tip :content="$t('tooltip.memo_notice')" :offset="120"/>
            </div>
          </cybex-text-field>
          <p
            class="error-msg"
          >{{ !isMemoValid && memoChecked ? $t(`validation.invalid_memo_XRP`) : '' }}</p>
        </v-flex>
        <v-flex xs12 class="form-field">
          <cybex-text-field
            middle
            no-message
            v-model="amount"
            :label="$t('form_label.amount')"
            clearable
            :placeholder="$t('placeholder.min_amount', { minAmount, coinname })"
            solo
            @input="onAmountChanged"
          >
            <div slot="action" class="all-amount" bottom>
              <div @click="withdrawAll">{{ $t('button.all') }}</div>
            </div>
          </cybex-text-field>
          <p class="error-msg">{{ !isAmountValid && amountChecked ? amountErrMsg : '' }}</p>
        </v-flex>
        <v-flex xs12 class="show-fee">
          <p>
            <span class="fee-label">{{ $t('form_label.transfer_fee') }}</span>
            <span
              class="fee-amount"
            >{{ cybexfee.amount | roundDigits(cybexPrecision) }} {{ cybexfee.asset_id | coinName(coinMap) }}</span>
          </p>
          <p class="mb-3">
            <span class="fee-label">{{ $t('form_label.gateway_fee') }}</span>
            <span
              class="fee-amount"
            >{{ gatewayfee.amount | roundDigits(precision) }} {{ gatewayfee.asset_id | shorten }}</span>
          </p>
          <p>
            <span class="fee-label large">{{ $t('form_label.receive_amount') }}&nbsp;</span>
            <span
              class="fee-amount large"
            >{{ realAmount | roundDigits(precision) }} {{ gatewayfee.asset_id | shorten }}</span>
          </p>
        </v-flex>
        <v-flex xs12 class="pt-3">
          <cybex-btn
            middle
            block
            class="text-capitalize"
            :disabled="!canWithdraw"
            @click="onWithdrawClicked"
          >{{ $t('button.withdraw') }}</cybex-btn>
        </v-flex>
      </v-form>
      <v-dialog
        v-model="showConfirm"
        content-class="confirm-panel"
        width="402px"
        transition="slide-y-transition">
        <a class="btn-close" @click="showConfirm=false" icon>
          <v-icon>ic-close</v-icon>
        </a>
        <v-layout row wrap fluid class="mb-4" align-content-center>
          <v-flex xs12 class="header">{{ $t('sub_title.confirmation') }}</v-flex>
        </v-layout>
        <v-form ref="form" lazy-validation>
          <v-layout row wrap fluid align-content-center class="content">
            <v-flex xs12>
              <span class="left-label">{{ $t('form_label.withdraw_addr') }}:</span>
              <p class="confirm-addr">{{ address }}</p>
            </v-flex>
            <v-flex v-if="needShowMemo && memo" xs12>
              <span class="left-label">{{ $t('form_label.memo') }}:</span>
              <span class="confirm-num">&nbsp;{{ memo }}</span>
            </v-flex>
            <v-flex xs12 class="mb-2">
              <span class="left-label">{{ $t('form_label.amount') }}:</span>
              <span class="confirm-num">&nbsp;{{ amount | roundDigits(precision) }} {{ coinname }}</span>
            </v-flex>
            <v-flex xs12 class="mt-2">
              <span class="left-label">{{ $t('form_label.transfer_fee') }}</span>
              <span
                class="confirm-num"
              >&nbsp;{{ cybexfee.amount | roundDigits(cybexPrecision) }} {{ cybexfee.asset_id | coinName(coinMap) }}</span>
            </v-flex>
            <v-flex xs12>
              <span class="left-label">{{ $t('form_label.gateway_fee') }}</span>
              <span
                class="confirm-num"
              >&nbsp;{{ gatewayfee.amount | roundDigits(precision) }} {{ gatewayfee.asset_id | shorten }}</span>
            </v-flex>
            <v-flex xs12 class="receive-amount mt-3">
              <span class="left-label">{{ $t('form_label.receive_amount') }}</span>
              <span
                class="confirm-num"
              >&nbsp;{{ realAmount | roundDigits(precision) }} {{ coinname }}</span>
            </v-flex>
            <v-flex xs12 class="footer mt-4">
              <cybex-btn small block class="text-capitalize" :disabled="inSendTx" @click="sendTx">{{ $t('button.ok') }}</cybex-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-dialog>
    </template>
    <p class="forbid-info" v-else>{{ withInfo ? withInfo[`${localeShort}Msg`] : '' }}</p>
  </v-layout>
</template>

<script>
import { mapGetters } from "vuex";
import utils from "~/components/mixins/utils";
import { debounce } from "lodash";

export default {
  asyncData({ params, store }) {
    store.commit("UPDATE_DW_COINTYPE", params.cointype);
    return {
      cointype: params.cointype || "",
      isAddressValid: false,
      address: ""
    };
  },
  layout: "transfer",
  head() {
    return {
      title: this.$t("title.withdraw")
    };
  },
  components: {
    TransferSelector: () => import("~/components/TransferSelector.vue"),
    NoticeTip: () => import("~/components/NoticeTip.vue")
  },
  mixins: [utils],
  data() {
    return {
      showConfirm: false,
      amount: null,
      cybexfee: {},
      realAmount: 0,
      gatewayfee: {},
      withdrawAmount: 0,
      balance: 0,
      minAmount: 0,
      addrs: [],
      addressChecked: false,
      readyToSend: false,
      amountChecked: false,
      inSendTx: false,
      amountErrMsg: null,
      memo: "",
      memoChecked: false,
      precision: 0,
      cybexPrecision: 0,
      isMemoValid: false,
      withInfos: []
    };
  },
  computed: {
    ...mapGetters({
      username: "auth/username",
      coinMap: "user/coins",
      coinsInvert: "user/coinsInvert",
      islocked: "auth/islocked",
      showUnlock: "showUnlock",
      localeShort: "i18n/shortcut"
    }),
    canWithdraw() {
      return (
        this.addressChecked &&
        this.isAddressValid &&
        this.address &&
        this.amountChecked &&
        this.isAmountValid &&
        (!this.memo || this.memoChecked)
      );
    },
    isAmountValid() {
      return this.amount >= this.minAmount && this.amount <= this.balance;
    },
    needShowMemo() {
      return (this.withInfo || {}).tag
    },
    finalAddress() {
      return this.needShowMemo ? `${this.address}[${this.memo}]` : this.address;
    },
    withInfo() {
      return this.withInfos.find(e => {
        return e.id === this.coinsInvert[this.cointype];
      });
    },
    coinname () {
      return this.$options.filters.shorten(this.cointype)
    }
  },
  methods: {
    onAddressChanged: debounce(function() {
      this.addressChecked = false;
      this.validateAddress();
    }, 300),
    onAmountChanged: debounce(function() {
      this.amountChecked = false;
      this.validateFee();
    }, 350),
    onMemoChanged: debounce(function() {
      this.memoChecked = false;
      this.validateMemo();
    }, 300),
    onWithdrawClicked() {
      if (!this.islocked) {
        this.showConfirm = true;
      } else {
        this.readyToSend = true;
        this.$toggleLock();
      }
    },
    resetFee() {
      this.amount = null;
      this.gatewayfee = {};
      this.cybexfee = {};
      this.memo = null;
      this.realAmount = 0;
      this.withdrawAmount = 0;
      this.memoChecked = false;
      this.amountChecked = false;
      this.addressChecked = false;
      this.inSendTx = false;
    },
    async validateFee() {
      const value = parseFloat(this.amount);
      this.amountChecked = false;
      if (isNaN(value) || (!value && value !== 0)) {
        this.amount = null;
      } else {
        const newval = this.toNonExponential(this.amount, this.precision)
        const valstr = (newval.match(/^\d+(\.\d+)?/g) || [])[0]
        const idx = newval.indexOf('.')
        const formatted = idx > 0 ? [valstr.slice(0, idx), valstr.slice(idx + 1, idx + 1 + this.precision)].join('.') : value
        if (/^\d+\.$/g.test(valstr)) {
          this.amount = newval;
        } else {
          this.amount = formatted;
          this.amountChecked = true;
          if (value < this.minAmount) {
            this.realAmount = 0;
            this.amountErrMsg = this.$t("validation.too_low_amount", {
              cointype: this.coinname,
              minAmount: this.minAmount
            });
          } else if (value > this.balance) {
            this.realAmount = 0;
            this.amountErrMsg = this.$t("validation.too_high_amount");
          } else {
            await this.calFee(this.amount, this.cointype);
          }
        }
      }
    },
    async calFee(amount, cointype) {
      try {
        const result = await this.$callmsg(
          this.cybexjs.calAmountAndFee,
          this.username,
          amount,
          this.coinsInvert[cointype],
          this.finalAddress
        );
        if (result) {
          this.gatewayfee = result.gatewayfee;
          this.cybexfee = result.cybexfee;
          // 转账手续费精度
          this.cybexPrecision =
            result.cybexfee.asset_id === this.coinsInvert[cointype]
              ? this.precision
              : 5;
          this.realAmount = result.real_amount > 0 ? result.real_amount : 0;
          this.withdrawAmount = result.withdraw_amount;
        }
      } catch (e) {
        // console.log('some error when calfee', e)
      }
    },
    async validateMemo() {
      this.memo = this.memo.trim();
      if (this.coinname === "XRP") {
        if (this.memo && !isNaN(this.memo)) {
          this.memo = parseInt(this.memo);
        }
        this.isMemoValid =
          !this.memo || (!isNaN(this.memo) && this.memo <= 4294967295);
      } else {
        this.isMemoValid = true;
      }
      this.memoChecked = true;
      await this.calFee(this.amount, this.cointype);
    },
    async fetchBalance(cointype) {
      try {
        const info = await this.$callmsg(
          this.cybexjs.balances,
          this.username,
          this.coinsInvert[cointype]
        );
        const data = await this.$callmsg(
          this.cybexjs.queryAsset,
          this.coinsInvert[cointype]
        );
        this.precision = data.precision;
        this.balance = (info && data) ? info.balance / Math.pow(10, data.precision) : 0;
      } catch (e) {
        // console.log('some error when fetch balance')
      }
    },
    async validateAddress() {
      this.addressChecked = false;
      this.isAddressValid = await this.$callmsg(
        this.cybexjs.checkAddress,
        this.cointype,
        this.username,
        this.address
      );
      this.addressChecked = true;
    },
    async sendTx() {
      // coin, coin_symbol, amount, addr ,fee_asset_id
      // console.log('####### send tx: ', this.cointype, this.gatewayfee.asset_id,
      // this.withdrawAmount, this.finalAddress, this.cybexfee.asset_id, this.cybexjs.withdraw)
      try {
        this.inSendTx = true;
        const ret = await this.$callmsg(
          this.cybexjs.withdraw,
          this.cointype,
          this.gatewayfee.asset_id,
          this.withdrawAmount,
          this.finalAddress,
          this.cybexfee.asset_id
        );
        // console.log('==== send tx result: ', ret, this.finalAddress)
        if (ret) {
          this.$message({
            message: this.$t("message.withdraw_succ")
          });
          this.$nextTick(async () => {
            this.showConfirm = false;
            this.address = "";
            this.resetFee();
            await this.fetchBalance(this.cointype);
            this.inSendTx = false;
          });
        }
      } catch (e) {
        // console.log(e)
        this.inSendTx = false;
      }
    },
    async fetchNotice() {},
    checkAmount(value) {
      return this.$t("validation.not_enough_balance", {
        cointype: this.cointype
      });
    },
    async withdrawAll() {
      // 全部金额提现
      this.amount = this.balance.toString();
      await this.validateFee();
    },
    async fetchMinAmount(cointype) {
      try {
        const res = await this.$callmsg(this.cybexjs.withdraw_info, cointype);
        const info = res.data.withdrawInfo;
        this.minAmount = info.minValue;
      } catch (e) {}
    },
    async checkEnable() {
      try {
        this.withInfos = await this.$callmsg(this.cybexjs.withdraw_list);
      } catch (e) {}
    }
  },
  watch: {
    async username(val) {
      if (!val) return;
      this.address = '';
      // this.showConfirm = false;
      this.resetFee();
      await this.checkEnable();
      this.fetchBalance(this.cointype);
      await this.fetchMinAmount(this.cointype);
      await this.calFee(0, this.cointype);
    },
    showUnlock(newval, oldval) {
      if (!newval) {
        if (this.readyToSend && !this.islocked) {
          this.showConfirm = true;
        }
        this.readyToSend = false;
      }
    },
    $route: async function(route) {
      await this.checkEnable();
      this.fetchBalance(route.params.cointype);
      await this.fetchMinAmount(route.params.cointype);
      await this.calFee(0, route.params.cointype);
    }
  },
  async mounted() {
    await this.checkEnable();
    this.fetchBalance(this.cointype);
    await this.fetchMinAmount(this.cointype);
    await this.calFee(0, this.cointype);
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.confirm-panel {
  // width: 402px;
  // height: 367px;
  padding: 32px;
  border-radius: 4px;
  // box-shadow: 0 8px 10px 0 rgba(0, 0, 0, 0.2), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 16px 24px 2px rgba(0, 0, 0, 0.14);
  background-color: #212939;
  line-height: 1.83;
  overflow-y: hidden;

  .header {
    font-size: 18px;
    f-cybex-style('black', medium);
  }

  .receive-amount {
    box-shadow: inset 0 -1px 0 0 rgba(255, 255, 255, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
    height: 40px;
    line-height: 40px;
  }

  .left-label {
    font-size: 12px;
    color: rgba($main.white, 0.4);
  }

  .confirm-num {
    font-size: 12px;
    line-height: 1.83;
    color: rgba($main.white, 0.8);
    margin-bottom: initial;
    word-break: break-word;
    f-cybex-style('heavy');
  }

  .confirm-addr {
    font-size: 12px;
    color: rgba($main.white, 0.8);
  }

  .cl-6 {
    margin-top: 20px;
  }
}
</style>
