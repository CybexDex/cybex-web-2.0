<template>
  <div>
    <!-- form -->
    <v-form
      class="cybex exchange fill-height exchange-block-container"
      v-model="valid"
      ref="form"
      lazy-validation
    >
      <!-- balances -->
      <v-flex justify-space-between d-flex class="exchange-block-title">
        <v-flex d-flex grow class="keep-inline b-half">{{ isBuy ? $t('exchange.order-form.title.buy') : $t('exchange.order-form.title.sell') }} &nbsp;<asset-pairs v-if="!asset_is_custom" :max-width="'calc(100% - 30px)'" :asset-id="quoteCurrency" /></v-flex>
        <v-flex class="text-lg-right money keep-inline">
          <v-icon size="16" v-text="'ic-balance_wallet'"/>
          <span v-if="hideBalance">--</span>
          <span v-else>
            <span v-if="balances" v-text="balances"/>
          </span>
          <span class="unit"><asset-pairs :max-width="'45%'" :asset-id="isBuy ? baseCurrency : quoteCurrency" /></span>
        </v-flex>
      </v-flex>
      <!-- price -->
      <v-layout row>
        <label class="exchange-form-input-label">{{ $t('exchange.order-form.label.price') }}:</label>
        <v-layout d-flex column>
          <div class="exchange-form-input-wrapper">
            <input
              :class="{'has-error': priceError!=''}"
              v-model="price"
              ref="priceInput"
              type="number"
              :placeholder="getStep('price_step')"
              @keypress="validUserKeypress($event)"
              @input="validUserInput('price', $event)"
              class="d-flex exchange-form-input theme--cybex-dark"
              :step="getStep('price_step')"
            >
            <span class="exchange-form-input-suffix"><asset-pairs :color-opacity="0.5" :max-width="'60px'" :asset-id="baseCurrency" /></span>
            <span v-if="priceError" class="exchange-form-input-error">{{ priceError }}</span>
          </div>
          <span class="legal-tender c-white-30">
            <template v-if="legalPrice">≈ <span v-text="legalPrice"/></template>
          </span>
        </v-layout>
      </v-layout>
      <!-- amount -->
      <v-layout row>
        <label class="exchange-form-input-label">{{ $t('exchange.order-form.label.amount') }}:</label>
        <v-layout d-flex column>
          <div class="exchange-form-input-wrapper">
            <input
              :class="{'has-error': amountError!=''}"
              v-model="amount"
              ref="amountInput"
              type="number"
              :placeholder="getStep('amount_step')"
              @keypress="validUserKeypress($event)"
              @input="validUserInput('amount', $event)"
              class="d-flex exchange-form-input"
              :step="getStep('amount_step')"
            >
            <span class="exchange-form-input-suffix"><asset-pairs :color-opacity="0.5" :max-width="'60px'" :asset-id="quoteCurrency" /></span>
            <span v-if="amountError" class="exchange-form-input-error">{{ amountError }}</span>
          </div>
          <v-flex d-flex justify-space-between class="flex-label amount">
            <span
              v-for="(pos, i) in tradingPosition"
              :class="{'selected': pos.selected}"
              @click="calcTradingPosition(pos.val)"
              :key="i"
            >{{ pos.val * 100 }}%</span>
          </v-flex>
        </v-layout>
      </v-layout>
      <!-- total -->
      <v-layout row>
        <label class="exchange-form-input-label">{{ $t('exchange.order-form.label.total') }}:</label>
        <v-flex>
          <div class="exchange-form-input-wrapper">
            <input
              :class="{'has-error': totalError!=''}"
              v-model="total"
              ref="totalInput"
              type="number"
              :placeholder="getStep('total_step')"
              :step="getStep('total_step')"
              @keypress="validUserKeypress($event)"
              @input="validUserInput('total', $event)"
              class="d-flex exchange-form-input"
            >
            <span class="exchange-form-input-suffix"><asset-pairs :color-opacity="0.5" :max-width="'60px'" :asset-id="baseCurrency"/></span>
            <span v-if="totalError" class="exchange-form-input-error">{{ totalError }}</span>
          </div>
        </v-flex>
      </v-layout>
      <div class="no-login" v-if="!username">
        <router-link :to="$i18n.path('/')">{{ $t('exchange.order-form.button.login') }}</router-link>
        {{ $t('exchange.order-form.button.or') }}
        <router-link :to="$i18n.path('/register')">{{ $t('exchange.order-form.button.register') }}</router-link>
        {{ $t('exchange.order-form.button.to-trade') }}
      </div>
      <template v-else>
        <!-- fee -->
        <v-layout class="fee">
          <span class="label mr-2">{{ $t('exchange.order-form.label.fee') }}:</span>
          <span class="money" v-if="fee.length === 0" v-text="'--'"/>
          <span class="money" v-else v-for="(f,i) in fee" :key="i">
            {{ f.amount }}
            <span class="unit"><asset-pairs :asset-id="f.asset_id" /></span>
          </span>
          <v-tooltip
            right 
            top
            :nudge-right="100"
            :nudge-top="8"
            :content-class="'cybex-tips'">
            <span slot="activator" class="ml-1 desc ic-help"/>
            <span>{{ $t('exchange.order-form.fee-desc') }}</span>
          </v-tooltip>
        </v-layout>
        <!-- order button or login panel-->
        <cybex-btn
          v-if="couldCreateTrade && !isCreatingTrade"
          normal
          block
          :class="{'is-buy': isBuy}"
          @click="beforeCreateTrade"
        >{{ isBuy ? $t('exchange.order-form.title.buy') : $t('exchange.order-form.title.sell') }} &nbsp; <asset-pairs :asset-id="quoteCurrency" /></cybex-btn>
        <cybex-btn
          v-else
          normal
          block
          :class="{'is-buy': isBuy}"
          :disabled="true"
        >{{ isBuy ? $t('exchange.order-form.title.buy') : $t('exchange.order-form.title.sell') }}&nbsp; <asset-pairs :asset-id="quoteCurrency" /></cybex-btn>
      </template>
    </v-form>
    <!-- form end -->
    <!-- confirm dialog -->
    <v-dialog width="400" dark v-model="confirmForm">
      <v-card>
        <v-card-title class="headline">
          {{ $t('exchange.dialog.confirm-order', {
            action: isBuy ? $t('exchange.order-form.title.buy') : $t('exchange.order-form.title.sell'),
            currency: shortenQuoteCurrency
          }) }}
        </v-card-title>
        <v-card-text class="headline">
          <p class="line head" :class="{'c-buy': isBuy, 'c-sell': !isBuy}">
            <span class="label">{{ $t('exchange.order-form.label.price') }}:</span>
            {{ confirmPrice }} <asset-pairs :asset-id="baseCurrency" />
          </p>
          <p class="line">
            <span class="label">{{ $t('exchange.order-form.label.amount') }}:</span>
            {{ amount }} <asset-pairs :asset-id="quoteCurrency" />
          </p>
          <p class="line">
            <span class="label">{{ $t('exchange.order-form.label.total') }}:</span>
            {{ total }} <asset-pairs :asset-id="baseCurrency" />
          </p>
          <p class="line" v-if="fee.length > 0">
            <span class="label">{{ $t('exchange.order-form.label.fee') }}:</span>
            {{ fee[0].amount }} {{ fee[0].asset_id | coinName(coinsMap) }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-flex d-flex justify-space-between>
            <v-flex d-flex>
              <cybex-btn
                small
                color="pre-minor"
                class="actions cancel m-l"
                @click="confirmForm = false"
              >{{ $t('exchange.dialog.Cancel') }}</cybex-btn>
            </v-flex>
            <v-flex d-flex>
              <cybex-btn
                small
                color="major"
                class="actions confirm"
                :disabled="!couldConfirmCreateTrade"
                @click="clickCreateTrade"
              >{{ $t('exchange.dialog.OK') }}</cybex-btn>
            </v-flex>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { divide, findIndex, floor, ceil, round } from "lodash";
import { BigNumber } from 'bignumber.js';
import utils from "~/components/mixins/utils";
export default {
  name: "ExchangeForm",
  props: {
    isBuy: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => {}
    },
    balanceDigits: {
      type: Object,
      default: () => {}
    }
  },
  data: function() {
    return {
      couldConfirmCreateTrade: false,
      intervalGetBalance: null,
      price: null,
      legalPrice: null,
      confirmForm: false,
      CYBAmount: 0,
      isCreatingTrade: false,
      needConfirmDialog: false,
      valid: true,
      amount: null,
      total: null,
      balances: null,
      fee: [],
      tradingPosition: [
        {
          val: 0.25,
          selected: false
        },
        {
          val: 0.5,
          selected: false
        },
        {
          val: 0.75,
          selected: false
        },
        {
          val: 1,
          selected: false
        }
      ]
    };
  },
  watch: {
    // 用户名变化时 重新拉取数据
    username: async function(val){
      this.balances = null;
      this.fee = [];
      this.CYBAmount = null;
      this.removeInterval();
      await this.initBalanceAndFee();
    },
    confirmForm: function(newV, oldV) {
      if (newV === false && oldV === true) {
        // 用户关闭弹窗后即可创建下一单
        this.isCreatingTrade = false;
      }
    },
    isLocked: function(v) {
      if (!v && this.needConfirmDialog) {
        this.confirmForm = true;
        this.couldConfirmCreateTrade = true;
        this.needConfirmDialog = false;
      }
    },
    async $route() {
      // 清空数据
      this.$refs.form.reset();
      this.amount = null;
      this.total = null;
      if (this.isConnect) {
        this.initBalanceAndFee();
      }
    },
    coinsInvert: async function() {
      if (this.isConnect) {
        this.initBalanceAndFee();
      }
    },
    price: async function(newV, oldV) {
      // input输出字符串, 通过计算得到的为float
      // 若值相等，视作没有变化
      if (oldV == newV) return;
      // 自定义资产无法币价格
      if (!this.isNumberValue(newV) || parseFloat(newV) === 0) {
        this.legalPrice = null;
      } else if (this.base_id && !this.asset_is_custom) {
        await this.getLegalPrice();
      }
    },
    formData: async function(newV, oldV) {
      let forceClean = "clean";
      let price;
      if (this.isBuy) {
        // set price change
        price = this.asset_is_custom ? this.$options.filters.shortenPrice(newV.buyPrice) : newV.buyPrice;
        if (parseFloat(price) === 0 && newV.autoSet) {
          this.legalPrice = null;
        } else {
          this.price = price;
        }
        // detect total
        if (newV.buyTotal === forceClean) {
          this.total = null;
          this.recalculateForm("total", null);
        } else if (newV.buyTotal && newV.buyTotal !== this.total) {
          const total = parseFloat(newV.buyTotal).toFixed(this.totalDigits);
          this.total = total;
          this.recalculateForm("total", total);
        } else {
          this.recalculateForm("price");
        }
      } else {
        price = this.asset_is_custom ? this.$options.filters.shortenPrice(newV.sellPrice) : newV.sellPrice;
        if (parseFloat(price) === 0) {
          this.legalPrice = null;
        } else {
          this.price = price;
        }
        if (newV.sellAmount === forceClean) {
          this.amount = null;
          this.recalculateForm("amount", null);
        } else if (newV.sellAmount && newV.sellAmount !== this.amount) {
          const amount = parseFloat(newV.sellAmount).toFixed(this.amountDigits);
          this.amount = amount;
          this.recalculateForm("amount", amount);
        } else {
          this.recalculateForm("price");
        }
      }
    }
  },
  mixins: [utils],
  computed: {
    ...mapGetters({
      locale: "i18n/locale",
      symbol: "i18n/symbol",
      prefix: "exchange/prefix",
      isConnect: "exchange/connect",
      coinsMap: "user/coins",
      coinsInvert: "user/coinsInvert",
      username: "auth/username",
      baseCurrency: "exchange/base",
      quoteCurrency: "exchange/quote",
      asset_is_custom: "exchange/asset_is_custom",
      base_id: "exchange/base_id",
      quote_id: "exchange/quote_id",
      quote_digits: "exchange/quote_digits",
      base_digits: "exchange/base_digits",
      isLocked: "auth/islocked",
      refreshRate: "exchange/tradesRefreshRate"
    }),
    shortenQuoteCurrency() {
      let r = this.$options.filters.shortenContest(this.quoteCurrency, true);
      r = this.$options.filters.shorten(r);
      return r;
    },
    confirmPrice: function() {
      const total = new BigNumber(this.total);
      let t = this.isBuy 
        ? total.dividedBy(this.amount).toFixed(this.priceDigits, BigNumber.ROUND_FLOOR)
        : total.dividedBy(this.amount).toFixed(this.priceDigits, BigNumber.ROUND_CEIL);
        t = this.$options.filters.shortenPrice(t);
      return t;
    },
    priceError: function() {
      if (this.price && parseFloat(this.price) <= 0) {
        return this.$t("exchange.order-form.valid.price", { value: 0 });
      }
      if (this.$refs.priceInput) {
        return this.$refs.priceInput.validity.badInput ? this.$t("exchange.order-form.valid.number") : '';
      }
      return "";
    },
    amountError: function() {
      // 检查最小下单数量Amount和金额Total
      let minAmount = this.getMinVal("min_trade_amount");
      // if (!this.amount && this.formIsSubmitted) {
      //   return "Amount is required";
      // }
      if (minAmount && parseFloat(this.amount) < parseFloat(minAmount)) {
        return this.$t("exchange.order-form.valid.amount", {
          value: minAmount
        });
      }
      if (this.$refs.amountInput) {
        return this.$refs.amountInput.validity.badInput ? this.$t("exchange.order-form.valid.number") : '';
      }
      return "";
    },
    totalError: function() {
      let minTotal = this.getMinVal("min_order_value");
      if (minTotal && parseFloat(this.total) < parseFloat(minTotal)) {
        return this.$t("exchange.order-form.valid.total", { value: minTotal });
      }
      if (this.$refs.totalInput) {
        return this.$refs.totalInput.validity.badInput ? this.$t("exchange.order-form.valid.number") : '';
      }
      return "";
    },
    priceDigits: function() {
      const defaultDigits = this.asset_is_custom ? 8 : 2;
      return new BigNumber(this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "book",
        "last_price",
        defaultDigits
      )).toNumber();
    },
    totalDigits: function() {
      const defaultDigits = this.asset_is_custom ? this.base_digits : 2;
      return new BigNumber(this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "book",
        "total",
        defaultDigits
      )).toNumber();
    },
    amountDigits: function() {
      const defaultDigits = this.asset_is_custom ? this.quote_digits : 2;
      return new BigNumber(this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "book",
        "amount",
        defaultDigits
      )).toNumber();
    },
    couldCreateTrade: function() {
      if (
        !this.price ||
        !this.amount ||
        !this.total ||
        this.priceError !== "" ||
        this.amountError !== "" ||
        this.totalError !== ""
      )
        return false;
      // if (this.confirmForm) return false; //弹窗打开时不允许创建
      if (!this.fee.length) return false;
      let result;
      const balance = new BigNumber(this.balances)
      const amount = new BigNumber(this.amount)
      const feeAmount = new BigNumber(this.fee[0].amount)
      const total = new BigNumber(this.total)
      if (this.isBuy) {
        let asset_id = this.getCoinId(this.baseCurrency);
        // 买单 查看total和balance的关系
        result = balance.isGreaterThanOrEqualTo(total);
        // 如果交易的是CYB
        // 或者CYB余额不足支付,
        // total 需要包含手续费
        if (
          result &&
          (this.baseCurrency === "CYB" || this.fee[0].asset_id !== "1.3.0")
        ) {
          // @see http://mikemcl.github.io/bignumber.js/#cmp
          const compare =
            balance.minus(feeAmount).comparedTo(total);
          result = compare !== null && compare >= 0;
        }
      } else {
        // 卖单 查看amount和balance的关系
        result = balance.isGreaterThanOrEqualTo(amount);
        // 查看手续费是否足够
        if (
          result &&
          (this.quoteCurrency === "CYB" || this.fee[0].asset_id !== "1.3.0")
        ) {
          const compare =
            balance.minus(feeAmount).comparedTo(amount);
          result = compare !== null && compare >= 0;
        }
      }
      return result;
    },

    hideBalance: function() {
      return (
        this.username === "" || this.username === null || this.balances === null
      );
    }
  },
  async mounted() {
    if (this.isConnect) {
      await this.initBalanceAndFee();
    }
    document.addEventListener("visibilitychange", this.bindIntervalEvent);
  },
  beforeDestroy() {
    this.removeInterval();
    document.removeEventListener("visibilitychange", this.bindIntervalEvent);
  },
  methods: {
    async bindIntervalEvent (){
      if (document.visibilityState == "hidden") {
        this.removeInterval();
      } else if (document.visibilityState == "visible") {
        await this.initBalanceAndFee();
      }
    },
    removeInterval: function() {
      clearInterval(this.intervalGetBalance);
      this.intervalGetBalance = null;
    },
    async initBalanceAndFee() {
      let func = async () => {
        await this.getCybAmount();
        return Promise.all([
          await this.calcFee(),
          await this.getBalances()
        ]).then(() => {
          // console.log('init balance and fee');
        });
      };
      await func();
      // 自动刷账户余额
      if (!this.intervalGetBalance) {
        this.intervalGetBalance = setInterval(async () => {
          await func();
        }, this.refreshRate);
      }
    },
    getDigits(v) {
      let d = 0;
      let t = v.split(".");
      if (t.length > 1) d = t[1].length;
      return d;
    },
    validateForm: function() {
      let result = true;
      // 无余额 无可用手续费 无
      if (!this.balances || !this.fee.length) {
        result = false;
      }
      // Amount Price Total 缺一不可
      if (!this.total || !this.price || !this.amount) {
        result = false;
      }
      return result;
    },
    validUserKeypress($event) {
      if ($event.key == "." && $event.target.value.indexOf(".") > -1) {
        // 检查是否唯一小数点
        $event.preventDefault();
      }
    },
    // 判定用户是否手动输入的Price和Amount, Total是否合理并进行重新计算
    validUserInput(type, $event) {
      // 不出现科学计数法
      let correctVal = $event.target.value;
      let maxDp = this[type +'Digits'] ?  this[type +'Digits'] : 2;
      correctVal = this.toNonExponential($event.target.value, maxDp);
      if (isNaN(correctVal)) {
        correctVal = '';
      }
      // 重新赋值
      this.$set(this, type, correctVal);
      // 重新计算
      this.recalculateForm(type, correctVal);
    },
    // 获取对应法币价格
    async getLegalPrice() {
      if (!this.base_id && !this.price && !this.locale) return;
      let p = await this.cybexjs.assetValue(
        this.base_id,
        this.price,
        this.locale == "en" ? this.prefix + "USDT" : null,
      );
      this.legalPrice = this.$options.filters.legalDigits(p, this.symbol);
    },
    isNumberValue(v) {
      return v !== null && !isNaN(v) && v !== "" && typeof v !== "undefined";
    },
    // 重新计算表单
    recalculateForm(updateBy, val) {
      if (typeof val === undefined) {
        val = this[updateBy];
      }
      // console.log("user updated field >> " + updateBy, val);
      if (updateBy == "total") {
        if (!this.isNumberValue(this.total)) {
          this.total = null;
          this.amount = null;
        } else if (this.isNumberValue(this.price) && this.price != 0) {
          const total = new BigNumber(this.total);
          const price = new BigNumber(this.price);
          this.amount = total.dividedBy(price).toFixed(this.amountDigits, BigNumber.ROUND_FLOOR);
        } else {
          this.amount = null;
        }
      } else if (updateBy == "price" || updateBy == "amount") {
        if (this.isNumberValue(this.price) && this.isNumberValue(this.amount)) {
          const amount = new BigNumber(this.amount);
          const price = new BigNumber(this.price);
          // console.log('updated price', price, this.price);
          this.total = amount.multipliedBy(price).toFixed(this.totalDigits, BigNumber.ROUND_CEIL);
        } else {
          this.total = null;
        }
      }
      // console.log("this.price", this.price);
      // console.log("this.total", this.total);
      // console.log("this.amount", this.amount);
    },
    //获取CYB余额
    async getCybAmount() {
      if (!this.username) {
        this.CYBAmount = 0;
        return;
      }
      if (this.CYBAmount) return;
      // 检查账户CYB余额
      let CYBId = this.getCoinIdByName("CYB", this.coinsInvert);
      let CYB1 = await this.cybexjs.balances(this.username, CYBId);
      let CYBAmount = 0;
      if (CYB1) {
        this.CYBAmount = await this.cybexjs.assetAmount(CYBId, CYB1.balance);
      } else {
        this.CYBAmount = 0;
      }
      // console.log("CYB余额", CYB1, this.CYBAmount);
    },
    beforeCreateTrade() {
      // 强制显示精度
      this.price = this.$options.filters.shortenPrice(parseFloat(this.price).toFixed(this.priceDigits));
      this.amount = parseFloat(this.amount).toFixed(this.amountDigits);
      this.total = parseFloat(this.total).toFixed(this.totalDigits);
      // 检查用户是否已锁
      if (this.isLocked) {
        // 弹出解锁框
        this.needConfirmDialog = true;
        this.$toggleLock();
      } else {
        this.confirmForm = true;
        this.couldConfirmCreateTrade = true;
      }
    },
    async clickCreateTrade() {
      this.$eventHandle(this.createTrade, [], {user: true, server: false})
        .then(() => {
          this.$message({
            message: this.$t("message.order_pended"),
            type: "success"
          });
        })
        .catch(e => {
          if (!e.user) {
            this.$message({
              message: this.$t("message.order_pended_failed"),
              type: "error"
            });
          }
        }).finally(() => {
          // 防止弹窗开着的情况下确认下单按钮变量
          setTimeout(() => {
            this.couldConfirmCreateTrade = true;
          }, 3000);
        });
    },
    // 创建订单
    async createTrade() {
      // 首先表单验证
      if (!this.validateForm()) return false;
      this.isCreatingTrade = true;
      this.couldConfirmCreateTrade = false;
      const side = this.isBuy ? "buy" : "sell";
      const base_id = this.base_id;
      const quote_id = this.quote_id;
      console.log(
        "创建订单 param",
        {
          base_id: base_id,
          quote_id: quote_id,
          side: side,
          price: this.price,
          amount: this.amount,
          fee_id: this.fee[0].asset_id,
          total: this.total
        },
        new Date()
      );
      let sid = await this.cybexjs.limit_order_create(
        base_id,
        quote_id,
        side,
        this.price,
        this.amount,
        this.fee[0].asset_id,
        this.total
      );
      if (sid !== null) {
        this.$emit("create-trade-success");
        this.$message({
          message: "Order Pended",
          type: "success"
        });
      }
      this.confirmForm = false;
    },
    // 计算仓位
    // 如果手续费和交易币种一致, 说明CYB余额不足以支付手续费
    // 总成交金额 需要 额外扣除当前币种的手续费
    // 具体数值由 calcFee函数从服务器获得
    calcTradingPosition(p) {
      if (!this.balances) return;
      if (!this.fee) return;
      if (this.isBuy) {
        // Buy买单 设置Total
        let total = new BigNumber(this.balances).multipliedBy(p);
        // 判定是否有额外手续费
        if (
          p == 1 &&
          this.getCoinId(this.baseCurrency) === this.fee[0].asset_id
        ) {
          total = total.minus(this.fee[0].amount);
        }
        // 按照total精度四舍五入
        total = total.isGreaterThan(0) ? total.toFixed(this.totalDigits) : 0;
        this.total = total;
        this.recalculateForm("total", total);
      } else {
        // Sell卖单 设置Amount
        let amount = new BigNumber(this.balances).multipliedBy(p);
        if (p == 1 && this.quote_id === this.fee[0].asset_id) {
          amount = amount.minus(this.fee[0].amount);
        }
        // 按照amount精度向下取整
        // console.log('amount',  amount, this.amountDigits);
        amount = amount.isGreaterThan(0) ? amount.toFixed(this.amountDigits, BigNumber.ROUND_FLOOR) : 0;
        this.amount = amount;
        this.recalculateForm("amount", amount);
      }
    },
    getCoinId(coin) {
      return this.getCoinIdByName(coin, this.coinsInvert);
    },
    getStep(key) {
      let defaultVal;
      if (key == 'price_step') {
        defaultVal = this.toNonExponential(Math.pow(10, 0 - this.priceDigits), this.priceDigits);
      } else if (key == 'amount_step') {
        defaultVal = this.toNonExponential(Math.pow(10, 0 - this.amountDigits), this.amountDigits);
      } else if (key == 'total_step') {
        defaultVal = this.toNonExponential(Math.pow(10, 0 - this.totalDigits), this.totalDigits);
      }
      return this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "form",
        key,
        defaultVal
      );
    },
    getMinVal(key) {
      return this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "form",
        key,
        0
      );
    },
    async calcFee() {
      if (!this.coinsInvert || !this.username) return;
      if (!this.CYBAmount) {
        await this.getCybAmount();
      }
      // console.log("CYB余额", this.CYBAmount);
      let asset_id = this.getCoinId(
        this.isBuy ? this.baseCurrency : this.quoteCurrency
      );
      console.log(">>> 查询手续费 param", this.username, asset_id);
      let fee = await this.cybexjs.tradefee(this.username, asset_id);
      let feeCYB = fee[0];
      let feeCurrent = fee[1];
      // 账户CYB不足以支付，显示销售币fee
      if (new BigNumber(feeCYB.amount).isGreaterThan(this.CYBAmount)) {
        fee = feeCurrent;
      } else {
        fee = feeCYB;
      }
      const feeDigits = await this.cybexjs.queryAsset(fee.asset_id);
      // 转换科学计数与精度
      fee.amount = this.toNonExponential(fee.amount, feeDigits.precision, null);
      this.fee = [fee];
      // console.log(">>> 手续费", this.fee);
    },
    // 钱包余额
    async getBalances() {
      if (!this.coinsInvert || !this.username) return;
      let asset_id = this.getCoinId(
        this.isBuy ? this.base_id : this.quote_id
      );
      // console.log(">>> 查询余额 param", this.username, asset_id);
      // t1 链上数量 转化为实际数量 t2
      let t1 = await this.cybexjs.balances(this.username, asset_id);
      if (t1) {
        let t2 = await this.cybexjs.assetAmount(asset_id, t1.balance);
        this.balances = t2;
      } else {
        this.balances = 0;
      }
      this.balances = this.$options.filters.floorDigits(
        this.balances,
        this.isBuy ? this.balanceDigits.base : this.balanceDigits.quote
      );
      // console.log(">>> 余额结果", this.balances);
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~assets/style/_vars/_colors';
@import '~assets/style/_fonts/_font_mixin';

.flex-label {
  &.amount {
    flex: 1 1 auto !important;
    min-height: 38px;
    align-items: center;
    margin-right: 0;
  }
}

.cybex-tips {
  max-width: 262px;
}
.t1 {
  // min-width: 45%;
}
// 覆写vuetify text-field solo样式
// 用于交易所页面的表单
.exchange-block-container {
  padding-bottom: 14px;
}

.exchange-form-input-label {
  display: flex;
  align-items: center;
  text-align: left;
  flex: 0 1 0;
  height: 30px;
  color: rgba($main.white, 0.8);
  min-width: 64px;
  f-cybex-style('heavy');
}

.exchange-form-input-wrapper {
  position: relative;
  f-cybex-style('heavy');

  .exchange-form-input {
    position: relative;
    height: 32px;
    margin: 0;
    padding: 7px 2px 5px 8px;
    box-shadow: none !important;
    border-radius: 4px;
    background-color: $main.anchor;
    width: 100%;

    &:focus {
      outline: none;
      background-color: $main.independence;
    }
  }

  .exchange-form-input-suffix {
    position: absolute;
    right: 20px;
    top: calc(50% + 1px);
    transform: translateY(-50%);
    color: rgba($main.white, 0.5);
  }
}

form {
  &.exchange {
    .b-half {
      max-width: 131px;
    }
    .money {
      margin-left: 4px;
      color: $main.grey;
      f-cybex-style('black', 'heavy');
      text-align: right;

      .unit {
        color: $main.white;
        opacity: 0.3;
        padding-left: 2px;
      }
    }
    .desc {
      font-size: 16px;
      line-height: 0.5;
    }
    .legal-tender {
      margin: 6px 0 3px;
      min-height: 12px;
    }

    .no-login {
      background: $main.anchor;
      height: 40px;
      line-height: 40px;
      text-align: center;
      margin-top: 27px;
      margin-bottom: 16px;
      letter-spacing: 0.5px;

      a {
        f-cybex-style('heavy');
        color: $main.orange;
      }
    }

    .fee {
      margin-top: 14px;
      f-cybex-style('heavy');

      .label {
        color: rgba($main.white, 0.8);
      }
    }

    .v-btn {
      margin: 21px 0 0;
      background-image: linear-gradient(100deg, #d96250, #be4634) !important;

      &.is-buy {
        background-image: linear-gradient(100deg, #a9e06e, #8dc84f) !important;
      }
    }
  }
}
</style>