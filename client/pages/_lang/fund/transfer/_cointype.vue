<template>
  <v-layout row wrap class="transfer-form-wrapper">
    <template>
      <v-form ref="form">
        <v-flex xs12 class="form-field">
          <cybex-text-field
            :label="$t('form_label.transfer_account')"
            no-message
            v-model="account"
            :placeholder="$t('placeholder.enter_to')"
            class="field-addr mt-1"
            :append-label="accountId"
            clearable
            solo
            middle
            @input="onAccountChanged"
          />
          <p
            class="error-msg ml-1"
          >{{ !isAccountValid && accountChecked ? $t(`validation.${accountErr}`) : '' }}</p>
        </v-flex>
        <v-flex xs12 class="form-field">
          <!-- <span class="form-label">{{  }}</span> -->
          <!-- <span class="balance"><v-icon class="mr-2">ic-wallet_address</v-icon>{{ balance | roundDigits(precision) }} {{ cointype }}</span> -->
          <cybex-text-field
            :label="$t('form_label.amount')"
            v-model="amount"
            clearable
            middle
            no-message
            solo
            @input="onAmountChanged"
          >
            <div slot="append-label">
              <v-icon class="mr-2" size="16">ic-wallet_address</v-icon>
              {{ balance | roundDigits(precision) }}
              <asset-pairs :asset-id="cointype"/>
            </div>
            <div slot="action">
              <div @click="transferAll">{{ $t('button.all') }}</div>
            </div>
          </cybex-text-field>
          <p
            class="error-msg"
          >{{ !isAmountValid && amountChecked && amount && parseFloat(amount) > 0 ? $t('validation.not_enough_balance') : '' }}</p>
        </v-flex>
        <v-flex xs12 class="form-field">
          <span class="form-label">{{ $t('form_label.memo') }}</span>
          <v-textarea
            class="field-memo mt-2"
            no-message
            no-resize
            v-model="memo"
            :rows="3"
            solo
            @input="onMemoChanged"
          />
        </v-flex>
        <v-flex xs12 class="show-fee">
          <p>
            <span class="fee-label">{{ $t('form_label.transfer_fee') }}</span>
            <span
              class="fee-amount"
            >{{ cybexfee.amount | roundDigits(cybexPrecision) }} {{ cybexfee.asset_id | coinName(coinMap) }}</span>
          </p>
        </v-flex>
        <v-flex xs12 class="mt-2">
          <cybex-btn
            block
            middle
            :disabled="!canTransfer"
            @click="onWithdrawClicked"
          >{{ $t('button.send') }}</cybex-btn>
        </v-flex>
      </v-form>
      <v-dialog
        v-model="showConfirm"
        content-class="confirm-panel-transfer"
        width="402px"
        transition="slide-y-transition"
      >
        <a class="btn-close" @click="showConfirm=false" icon>
          <v-icon>ic-close</v-icon>
        </a>
        <v-layout row wrap fluid class="mb-4" align-content-center>
          <v-flex xs12 class="header">{{ $t('sub_title.transfer_detail') }}</v-flex>
        </v-layout>
        <v-form ref="form" lazy-validation>
          <v-layout row wrap fluid align-content-center class="content">
            <v-flex class="mb-2" xs12>
              <span class="left-label">{{ $t('form_label.transfer_account') }}:</span>
              <span class="confirm-num">&nbsp;{{ account }}</span>
            </v-flex>
            <v-flex xs12 class="mb-2">
              <span class="left-label">{{ $t('form_label.amount') }}:</span>
              <span class="confirm-num">&nbsp;{{ amount | roundDigits(precision) }} {{ coinname }}</span>
            </v-flex>
            <v-flex xs12 class="mb-2">
              <span class="left-label">{{ $t('form_label.transfer_fee') }}</span>
              <span
                class="confirm-num"
              >&nbsp;{{ cybexfee.amount | roundDigits(cybexPrecision) }} {{ cybexfee.asset_id | coinName(coinMap) }}</span>
            </v-flex>
            <v-flex v-if="!!memo && memo !== 0" xs12>
              <span class="left-label">{{ $t('form_label.memo') }}:</span>
              <div class="confirm-addr">
                <perfect-scrollbar :options="{wheelPropogation: false}">
                  <p>{{ memo }}</p>
                </perfect-scrollbar>
              </div>
            </v-flex>
            <v-flex xs12 class="footer mt-4">
              <cybex-btn small block :disabled="inSendTx" @click="sendTx">{{ $t('button.send') }}</cybex-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-dialog>
    </template>
  </v-layout>
</template>

<script>
import { mapGetters } from "vuex";
import utils from "~/components/mixins/utils";
import { debounce } from "lodash";
import PerfectScrollbar from "perfect-scrollbar";
import { BigNumber } from "bignumber.js";

export default {
  asyncData({ params, store }) {
    store.commit("UPDATE_DW_COINTYPE", params.cointype);
    return {
      cointype: params.cointype || "",
      isAccountValid: false
    };
  },
  layout: "transfer",
  head() {
    return {
      title: this.$t("title.transfer")
    };
  },
  components: {
    TransferSelector: () => import("~/components/TransferSelector.vue")
  },
  mixins: [utils],
  data() {
    return {
      showConfirm: false,
      amount: null,
      cybexfee: {},
      balance: 0,
      minAmount: 0,
      addrs: [],
      accountChecked: false,
      readyToSend: false,
      amountChecked: false,
      inSendTx: false,
      // amountErrMsg: null,
      memo: "",
      precision: 0,
      cybexPrecision: 0,
      accountErr: ""
    };
  },
  computed: {
    ...mapGetters({
      username: "auth/username",
      coinMap: "user/coins",
      coinsInvert: "user/coinsInvert",
      islocked: "auth/islocked",
      showUnlock: "showUnlock",
      memokey: "user/memokey",
      transferTo: "user/transferTo"
    }),
    canTransfer() {
      return (
        this.accountChecked &&
        this.isAccountValid &&
        this.account &&
        this.amountChecked &&
        this.isAmountValid
      );
    },
    isAmountValid() {
      return (
        parseFloat(this.amount) <= this.balance &&
        parseFloat(this.amount) > 0 &&
        this.cybexfee.amount &&
        (this.cybexfee.asset_id !== this.coinsInvert[this.cointype] ||
          parseFloat(
            (parseFloat(this.amount) + this.cybexfee.amount).toFixed(
              this.precision
            )
          ) <= this.balance)
      );
    },
    account: {
      get() {
        return this.transferTo.name;
      },
      set(value) {
        this.$store.commit("user/SET_TRANSFER_TO", {
          name: value,
          id: ""
        });
      }
    },
    accountId: {
      get() {
        return this.transferTo.id;
      },
      set(value) {
        this.$store.commit("user/SET_TRANSFER_TO", {
          name: this.transferTo.name,
          id: value
        });
      }
    },
    coinname() {
      return this.$options.filters.shorten(this.cointype);
    }
  },
  methods: {
    onAccountChanged: debounce(function() {
      this.accountChecked = false;
      this.validateAccount();
    }, 1000),
    onAmountChanged: debounce(function() {
      this.validateAmount();
    }, 1000),
    onMemoChanged: debounce(function() {
      this.validateMemo();
    }, 1000),
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
      this.cybexfee = {};
      this.memo = null;
      this.amountChecked = false;
      this.accountChecked = false;
      this.isAccountValid = false;
    },
    async validateAmount() {
      const value = parseFloat(this.amount);
      this.amountChecked = false;
      if (isNaN(value) || (!value && value !== 0)) {
        this.amount = null;
      } else {
        const newval = new BigNumber(value).toFixed(
          this.precision,
          BigNumber.ROUND_FLOOR
        );
        const formatted = this.toNonExponential(this.amount, this.precision);
        if (/^\d+\.$/g.test(this.amount)) {
          // do nothing
        } else {
          this.amount = formatted;
          this.amountChecked = true;
          if (value > this.balance) {
            // this.realAmount = 0
            // this.amountErrMsg = this.$t('validation.not_enough_balance')
          } else {
            await this.calFee(this.amount, this.cointype);
          }
        }
      }
    },
    async calFee(amount, cointype) {
      this.amountChecked = false;
      try {
        const cybfee = await this.$callmsg(
          this.cybexjs.fake_tr_memo_fee,
          this.memo,
          "1.3.0"
        );
        const coinfee = await this.$callmsg(
          this.cybexjs.fake_tr_memo_fee,
          this.memo,
          this.coinsInvert[this.cointype]
        );
        const CYB_amount = await this.$callmsg(
          this.cybexjs.balances,
          this.username,
          "1.3.0"
        );
        const cyb_fee = await this.$callmsg(
          this.cybexjs.assetAmountRaw,
          "1.3.0",
          cybfee.amount
        );
        const result =
          CYB_amount && CYB_amount.balance > cyb_fee ? cybfee : coinfee;

        if (result) {
          this.cybexfee = result;
          // 转账手续费精度
          this.cybexPrecision =
            result.asset_id === this.coinsInvert[this.cointype]
              ? this.precision
              : 5;
          if (
            result.asset_id === this.coinsInvert[this.cointype] &&
            parseFloat(this.amount) === this.balance
          ) {
            this.amount = (this.balance - result.amount).toFixed(
              this.precision
            );
          }
          this.amountChecked = true;
        }
      } catch (e) {
        // console.log('some error when calfee', e)
      }
    },
    async validateMemo() {
      this.memo = this.memo.trim();
      this.calFee();
    },
    async fetchBalance(cointype) {
      try {
        const info = await this.$callmsg(
          this.cybexjs.balances,
          this.username,
          this.coinsInvert[cointype]
        );
        // console.log('info', info);
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
    async validateAccount() {
      this.accountChecked = false;
      try {
        if (this.account) {
          if (this.account === this.username) {
            this.accountErr = "account_not_self";
            this.isAccountValid = false;
          } else {
            const accountInfo = await this.$call(
              this.cybexjs.get_user,
              this.account
            );
            if (accountInfo) {
              this.isAccountValid = true;
              this.accountId = `#${
                (accountInfo || { account: {} }).account.id
              }`;
            } else {
              this.isAccountValid = false;
              this.accountErr = "account_not_found";
            }
          }
        } else {
          this.isAccountValid = false;
          this.accountErr = "account_required";
        }
        this.accountChecked = true;
      } catch (e) {
        this.isAccountValid = false;
        this.accountChecked = true;
        this.accountErr = "account_not_found";
      }
    },
    async sendTx() {
      await this.$eventHandle(async () => 
        {
        this.inSendTx = true;
        return await this.cybexjs.transfer({
          to: this.account,
          amount: parseFloat(this.amount),
          asset: this.cointype,
          memo: this.memo,
          fee_asset_id: this.cybexfee.asset_id
        });
      }, [], {user: true, server: true}).then(res => {
        if (res) {
          this.$message({
            message: this.$t("message.transfer_succ")
          });
          this.$nextTick(async () => {
            this.showConfirm = false;
            this.resetFee();
            await this.validateAccount();
            await this.fetchBalance(this.cointype);
            this.inSendTx = false;
          });
        }
      }).catch(e => {
        console.log(e)
        this.inSendTx = false;
      })
      // try {
        
      // } catch (e) {
      //   // console.log(e)
       
      // }
    },
    checkAmount(value) {
      return this.$t("validation.not_enough_balance", {
        cointype: this.coinname
      });
    },
    async transferAll() {
      // 全部金额提现
      if (
        this.cybexfee.asset_id === this.coinsInvert[this.cointype] &&
        this.cybexfee.amount
      ) {
        this.amount = (this.balance - this.cybexfee.amount).toString();
      } else {
        this.amount = this.balance.toString();
      }
      this.validateAmount();
    }
  },
  watch: {
    async username(val) {
      if (!val) {return;}
      this.account = "";
      this.resetFee();
      this.$store.commit('user/CLEAR_MEMO_KEY')
      this.fetchBalance(this.cointype);
      if (!this.islocked) {
        const memokey = await this.$callmsg(this.cybexjs.findMemokey);
        this.$store.commit("user/SET_MEMO_KEY", memokey);
      }
      this.$nextTick(() => {
        if (this.memokey !== "empty") {
          new PerfectScrollbar(".field-memo textarea");
        }
        if (this.account) {
          this.validateAccount();
        }
      });
    },
    async showUnlock(newval, oldval) {
      if (!newval) {
        if (!this.islocked) {
          if (!this.memokey) {
            const memokey = await this.$callmsg(this.cybexjs.findMemokey);
            this.$store.commit("user/SET_MEMO_KEY", memokey);
          }
          if (this.readyToSend) {
            if (this.memokey === "empty") {
              this.memo = null;
              this.$message({
                message: this.$t("info.invalid_memokey"),
                type: "error"
              });
            } else {
              this.showConfirm = true;
            }
          }
        }
        this.readyToSend = false;
      }
    },
    async islocked(newval) {
      if (!newval && !this.memokey) {
        const memokey = await this.$callmsg(this.cybexjs.findMemokey);
        this.$store.commit("user/SET_MEMO_KEY", memokey);
      }
    },
    account(newval) {
      this.accountId = "";
    },
    $route: async function(route) {
      this.cointype = route.params.cointype;
      this.fetchBalance(route.params.cointype);
      this.$nextTick(() => {
        if (this.account) {
          this.validateAccount();
        }
      });
    }
  },
  async mounted() {
    this.fetchBalance(this.cointype);
    if (!this.islocked) {
      const memokey = await this.$callmsg(this.cybexjs.findMemokey);
      this.$store.commit("user/SET_MEMO_KEY", memokey);
    }
    this.$nextTick(() => {
      if (this.memokey !== "empty") {
        new PerfectScrollbar(".field-memo textarea");
      }
      if (this.account) {
        this.validateAccount();
      }
    });
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.confirm-panel-transfer {
  // width: 402px;
  // height: 367px;
  padding: 32px 32px;
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
    f-cybex-style(medium);
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
    height: 48px;
    overflow-y: hidden;

    .ps {
      background-color: initial;
    }

    p {
      font-size: 12px;
      color: white;
      word-break: break-all;
      f-cybex-style(medium);
    }
  }

  .cl-6 {
    margin-top: 20px;
  }

  .v-btn.btn-ok {
    padding: 0;
    margin: 0;
    height: 32px;
    width: 100%;
    background-image: linear-gradient(95deg, #ffc478, #ff9143);
    opacity: initial;
  }
}
</style>
