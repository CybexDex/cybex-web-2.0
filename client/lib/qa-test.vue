<template>
  <section class="container">
    <div>
      <p>
        <span @click="getcode" v-html="code"/>
        <span v-html="testhtml"/>
      </p>
      <v-layout row wrap>
        <v-flex xs2>
          <v-text-field label="username" v-model="newuser"/>
        </v-flex>
        <v-flex xs2 offset-xs1>
          <v-text-field label="password" v-model="newpassword"/>
        </v-flex>
        <v-flex xs2 offset-xs1>
          <v-text-field label="code" v-model="newcode"/>
        </v-flex>
        <v-flex xs2 offset-xs1>
          <v-btn color="success" @click="register">注册</v-btn>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs2>
          <v-text-field label="order_id" v-model="order.order_id"/>
        </v-flex>
        <v-flex xs2 offset-xs1>
          <v-btn color="success" @click="cancel_order">取消挂单</v-btn>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs1>
          <v-text-field label="base" v-model="trade.base"/>
        </v-flex>
        <v-flex xs1 offset-xs1>
          <v-text-field label="quote" v-model="trade.quote"/>
        </v-flex>
        <v-flex xs1 offset-xs1>
          <v-text-field label="side" v-model="trade.side"/>
        </v-flex>
        <v-flex xs1 offset-xs1>
          <v-text-field label="price" v-model="trade.price"/>
        </v-flex>
        <v-flex xs1 offset-xs1>
          <v-text-field label="amount" v-model="trade.amount"/>
        </v-flex>
        <v-flex xs2 offset-xs1>
          <v-btn color="success" @click="createtrade">交易</v-btn>
        </v-flex>
      </v-layout>
      <h2>
        <span v-if="$store.state.user.userkeys">unlocked</span>
        <span v-if="!$store.state.user.userkeys">locked</span>
        <span v-if="$store.state.user.bases">bases</span>
        <span v-if="!$store.state.user.bases">no_bases</span>
        <span v-if="$store.state.user.coins">coin_map_ok</span>
        <span v-if="!$store.state.user.coins">no_coin_map</span>
      </h2>
      <p>
        <v-btn color="success" @click="test_coin2name">coin2name</v-btn>
        <v-btn color="success" @click="test_loadBases">loadBases</v-btn>
        <v-btn color="success" @click="test_lock">lock</v-btn>
        <v-btn color="success" @click="test_unlock">unlock</v-btn>
        <v-btn color="success" @click="test_legal_currency">legal_currency</v-btn>
        <v-btn color="success" @click="test_loadbase">loadbase</v-btn>
        <v-btn color="success" @click="test_get_user">get_user</v-btn>
        <v-btn color="success" @click="test_limit_orders">limit_orders</v-btn>
        <v-btn color="success" @click="test_get_market_history">get_market_history</v-btn>
        <v-btn color="success" @click="test_lowhigh">lowhigh</v-btn>
        <v-btn color="success" @click="test_verify_code">verify_code</v-btn>
        <v-btn color="success" @click="test_register">register</v-btn>
        <v-btn color="success" @click="test_cancel_order">cancel_order</v-btn>
        <v-btn color="success" @click="test_limit_order_create">limit_order_create</v-btn>
        <v-btn color="success" @click="test_transfer">transfer</v-btn>
        <v-btn color="success" @click="test_get_deposit">get_deposit</v-btn>
        <v-btn color="success" @click="test_get_deposit_eos">get_deposit_eos</v-btn>
        <!-- <v-btn color="success" @click="test_new_deposit">new_deposit</v-btn> -->
        <v-btn color="success" @click="test_withdraw_info">withdraw_info</v-btn>
        <v-btn color="success" @click="test_withdraw">withdraw</v-btn>
        <v-btn color="success" @click="test_findBase">findBase</v-btn>
        <v-btn color="success" @click="test_fillorder_history">fillorder_history</v-btn>
        <v-btn color="success" @click="test_queryAsset">queryAsset</v-btn>
        <v-btn color="success" @click="test_genPassword">genPassword</v-btn>
        <v-btn color="success" @click="test_deposit_list">deposit_list</v-btn>
        <v-btn color="success" @click="test_withdraw_list">withdraw_list</v-btn>
        <v-btn color="success" @click="test_balances">balances</v-btn>
        <v-btn color="success" @click="test_assetAmount">assetAmount</v-btn>
        <v-btn color="success" @click="test_asset_icon">asset_icon</v-btn>
        <v-btn color="success" @click="test_checkAddress">checkAddress</v-btn>
        <v-btn color="success" @click="test_tradefee">tradefee</v-btn>
        <v-btn color="success" @click="test_calAmountAndFee">calAmountAndFee</v-btn>
        <v-btn color="success" @click="test_loadConfigedAssets">loadConfigedAssets</v-btn>
        <v-btn color="success" @click="test_queryLocked">queryLocked</v-btn>
        <v-btn color="success" @click="test_getTotalBalance">getTotalBalance</v-btn>
        <v-btn color="success" @click="test_getDepth">getDepth</v-btn>
        <v-btn color="success" @click="test_getOpenOrder">getOpenOrder</v-btn>
        <v-btn color="success" @click="test_getClosedOrder">getClosedOrder</v-btn>
        <v-btn color="success" @click="test_gatewayRecord">gatewayRecord</v-btn>
        <v-btn color="success" @click="test_assetValue">assetValue</v-btn>
        <v-btn color="success" @click="test_fake_tr_memo_fee">fake_tr_memo_fee</v-btn>
        <v-btn color="success" @click="test_top_asset">top_asset</v-btn>
        <v-btn color="success" @click="test_report">report</v-btn>
        <v-btn color="success" @click="test_claim_balance">claim_balance</v-btn>
        <v-btn color="success" @click="test_deposit_infos">deposit_infos</v-btn>
        <v-btn color="success" @click="test_withdraw_infos">withdraw_infos</v-btn>
        <v-btn color="success" @click="test_allMarket">allMarket</v-btn>
        <v-btn color="success" @click="test_gatewayAsset">gatewayAsset</v-btn>
        <v-btn color="red" @click="test_runAll">RunAllTests</v-btn>
      </p>
      <p>{{ out }}</p>
    </div>
  </section>
</template>
<script>
import { g } from "./cybex_help";
const assert = require("assert");
const _ = require('lodash')
const preg =  process.env.USE_TESTNET === '1' ? /^TEST./ : /^JADE./;
if (process.env.USE_TESTNET === '1') {
  const account = 'yinnan-test1'
  const password = 'P5JdYKiuB76GVXvD9MwY17WPhTapt7UED54N4wM1LVj7z'
} else {
  const account = 'titian0'
  const password = 'P5K4V934BN2DU47PruaMt9cejsAqkZjfNLU2LpWgR6QAY'
}

// import
export default {
  components: {},
  data() {
    return {
      code: "",
      codeid: "",
      newuser: "",
      newcode: "",
      newpassword: "",
      out: "",
      order: {},
      trade: {},
      testhtml: '<a href="http://www.baidu.com">welcome</a>'
    };
  },
  head() {
    return {
      title: this.$t("title.index")
    };
  },
  methods: {
    async sleepForSeconds(s) {
      console.log(`sleep for ${s} second(s)`)
      return new Promise(resolve => setTimeout(resolve, s*1000))
    },
    async test_coin2name() {
      let ret = await g.coin_id2name()
      console.log(ret)
      assert(ret, `id to name return to ${ret}`)
    },
    async test_loadBases() {
      let ret = await g.loadBases()
      console.log(ret)
      assert(ret, `load bases API return to ${ret}`)
    },
    async test_lock() {
      await g.lock(account, password, 5000)
    },
    async test_unlock() {
      let ret = await g.unlock(account, password, 5000)
      assert.equal(ret.code, 0, 'unlock account failed')
      assert.equal(ret.userkeys.length, 3, 'account keys length error')
      this.out = ret.code;
    },
    async test_legal_currency() {
      let ret = await g.legal_currency()
      console.log(ret)
      assert.equal(ret.code, 0, 'get legal currency failed')
    },
    async test_loadbase() {
      let id = "1.3.0"
      let ret = await g.loadbase(id)
      let bases = await g.loadBases()
      console.log(ret)
      assert.equal(ret.length, bases[id].data.length, `${id} base does not match bases`)
    },
    async test_get_user() {
      let id = '1.2.178'
      let name = 'yinnan-test1'
      let ret1 = await g.get_user(id)
      let ret2 = await g.get_user(name)
      console.log(ret1)
      assert(ret1, `get user ${name} return to ${JSON.stringify(ret2)}`)
      assert.ok(_.isEqual(ret1, ret2), `${name} get user does not return to the same result`)
    },
    async test_limit_orders() {
      let ret = await g.limit_orders('yinnan-test3')
      assert.equal(ret.length, 0)
      let ret2 = await g.limit_orders(account)
      console.log(ret2)
    },
    async test_get_market_history() {
      let ret = await g.get_market_history('1.3.23', '1.3.2', 3600, '2018-11-27T09:00:14', '2018-11-29T09:00:14')
      console.log(ret)
      assert(ret)
    },
    async test_lowhigh() {
      let ret = await g.lowhigh("1.3.23", "1.3.2")
      console.log(ret)
      assert(ret)
    },
    async test_verify_code() {
      let ret = await g.verify_code()
      console.log(ret)
      assert(ret)
    },
    async test_register() {

    },
    async test_cancel_order() {
      let ret = await g.limit_orders(account)
      console.log(ret.length)
      for (let i = 0; i < ret.length; i++) {
        console.log(ret[i])
        await g.cancel_order(ret[i].id)
      }
      ret = await g.limit_orders(account)
      console.log(ret.length)
    },
    async test_limit_order_create() {
      await g.unlock(account, password, 5000)
      let ret 
      try {
        ret = await g.limit_order_create('1.3.0', '1.3.23', 'buy', 0.1, 10000000);
        assert(false)
      } catch (err) {}
      try {
        let numOrder1 = await g.limit_orders(account)
        ret = await g.limit_order_create('1.3.0', '1.3.23', 'buy', 0.1, 0.1);
        let numOrder2 = await g.limit_orders(account)
        assert(numOrder2.length === numOrder1.length+1)
      } catch (err) {
        assert(false)
      }
    },
    async test_transfer() {

    },
    async test_get_deposit() {
      let ret1 = await g.get_deposit('ETH', account)
      let ret2 = await g.get_deposit('ETH', account)
      console.log(ret1.data.getDepositAddress.address)
      console.log(ret2.data.getDepositAddress.address)
      assert(ret1.data.getDepositAddress.address)
      assert(ret2.data.getDepositAddress.address)
      assert.equal(ret1.data.getDepositAddress.address, ret2.data.getDepositAddress.address)
    },
    async test_get_deposit_eos() {
      let ret1 = await g.get_deposit_eos(account)
      let ret2 = await g.get_deposit_eos(account)
      console.log(ret1.data.getDepositAddress.address)
      console.log(ret2.data.getDepositAddress.address)
      assert(ret1.data.getDepositAddress.address)
      assert(ret2.data.getDepositAddress.address)
      assert.equal(ret1.data.getDepositAddress.address, ret2.data.getDepositAddress.address)
    },
    async test_new_deposit() {
      console.log('obselete API')
    },
    async test_withdraw_info() {
      let ret = await g.withdraw_info("EOS")
      console.log(ret.data.withdrawInfo)
      assert(ret.data.withdrawInfo)
    },
    async test_withdraw() {
      await g.unlock(account, password, 5000)
      let before = await g.balances(account ,'1.3.0')
      console.log(before.balance)
      let ret = await g.withdraw('CYB', 'CYB', 0.00001, 'yinnan-test2')
      let after = await g.balances(account ,'1.3.0')
      console.log(after.balance)
      assert(before.balance > after.balance)
    },
    async test_findBase() {
      let ret1 = await g.findBase('1.3.23', '1.3.0')
      let ret2 = await g.findBase('1.3.0', '1.3.23')
      assert.equal(ret1, ret2)
      let ret3 = await g.findBase('1.3.0', '1.3.1')
      assert(!ret3)
    },
    async test_fillorder_history() {
      let ret1 = await g.fillorder_history(
        "test100",
        "2018-12-04T00:00:00",
         "2018-12-04T23:59:59",
        0,
        10,
        "1.3.2",
        "1.3.23"
      )
      let ret2 = await g.fillorder_history(
        "test100",
        "2018-12-04T00:00:00",
         "2018-12-04T23:59:59",
        0,
        10,
        "1.3.23",
        "1.3.2"
      )
      console.log(ret1)
      assert(ret1.length === 1)
      assert(_.isEqual(ret1, ret2))
    },
    async test_queryAsset() {
      let ret = await g.queryAsset("1.3.53")
      console.log(ret)
      assert(ret)
    },
    async test_genPassword() {
      let ret = await g.genPassword()
      console.log(ret)
      assert(ret && ret.startsWith('P'))
    },
    async test_deposit_list() {
      let ret = await g.deposit_list()
      console.log(ret)
      assert(ret)
    },
    async test_withdraw_list() {
      let ret = await g.withdraw_list()
      console.log(ret)
      assert(ret)
    },
    async test_balances() {
      let ret1 = await g.balances(account)
      console.log(ret1)
      assert(ret1 && ret1 instanceof Array)
      let ret2 = await g.balances(account, '1.3.0')
      console.log(ret2)
      assert(ret2)
    },
    async test_assetAmount() {
      let ret = await g.assetAmount('1.3.0', 100000)
      console.log(ret)
      assert(ret === '1.00000')
    },
    async test_asset_icon() {
      let ret = await g.asset_icon('1.3.0')
      console.log(ret)
      assert(ret)
    },
    async test_checkAddress() {
      let ret = await g.checkAddress('ETH', account, '0x98687e50d31376991553f03b1ffaa5606d3918e0')
      console.log(ret)
      assert(ret)
    },
    async test_tradefee() {
      let ret = await g.tradefee('1.2.178', '1.3.0')
      console.log(ret)
      assert(ret)
    },
    async test_calAmountAndFee() {
      let amount = 10
      let ret = await g.calAmountAndFee(account, amount, '1.3.2')
      console.log('-----------------------')
      console.log(ret)
      console.log('-----------------------')
      assert(ret.real_amount < amount)
    },
    async test_loadConfigedAssets() {
      let ret = await g.loadConfigedAssets()
      console.log(ret)
      assert(ret)
    },
    async test_queryLocked() {
      await g.unlock(account, password, 5000)
      let ret = await g.queryLocked()
      console.log(ret)
      assert(ret.length > 0)
    },
    async test_getTotalBalance() {
      let ret = await g.getTotalBalance(account)
      console.log(ret)
      assert(ret.length == 4)
    },
    async test_getDepth() {
      let precision = 2
      let num = 10
      let ret = await g.getDepth('1.3.23', '1.3.2', precision, num)
      console.log(ret)
      assert(ret)
      if (ret && ret.asks && ret.asks.length > 0) {
        let ask = ret.asks[0]
        let d = ask[0].split('.')[1]
        assert.equal(d.length, precision)
        assert(ret.asks.length <= num)
        assert(ret.bids.length <= num)
        console.log('--------------------')
        console.log('test passed')
        console.log('--------------------')
      }
    },
    async test_getOpenOrder() {
      let uid = '1.2.178'
      let before = await g.getOpenOrder(uid)
      await this.test_limit_order_create()
      let after = await g.getOpenOrder(uid)
      console.log(after)
      assert(after.length == before.length+1)
      await this.test_cancel_order()
      console.log('--------------------')
      console.log('test passed')
      console.log('--------------------')
    },
    async test_getClosedOrder() {
      let uid = '1.2.178'
      let ret = await g.getClosedOrder(uid)
      console.log(ret)
      assert(ret)
    },
    async test_gatewayRecord() {
      let ret = await g.gatewayRecord()
      console.log(ret)
      assert(ret)
      assert(false)
    },
    async test_assetValue() {
      let amount = 10
      let ret = await g.assetValue('1.3.0', amount, '1.3.0')
      console.log(ret)
      assert.equal(ret, amount)
      let ret2 = await g.assetValue('1.3.0', amount, '1.3.23')
      console.log(ret2)
      assert(ret2)
    },
    async test_fake_tr_memo_fee() {
      let ret = await g.fake_tr_memo_fee()
      console.log(ret)
      assert(ret)
    },
    async test_top_asset() {
      let ret = await g.top_asset()
      console.log(ret)
      assert(ret)
    },
    async test_report() {
      
    },
    async test_claim_balance() {
      // let ret = await g.claim_balance('1.15.136', '1.3.0', 0)
      // console.log(ret)
      // assert(ret)
    },
    async test_deposit_infos() {
      let ret = await g.deposit_infos('ETH')
      console.log(ret)
      assert(ret)
    },
    async test_withdraw_infos() {
      let ret = await g.withdraw_infos('ETH')
      console.log(ret)
      assert(ret)
    },
    async test_allMarket() {
      console.log()
      let ret = await g.allMarket()
      console.log(ret)
      assert(ret)
      let ret2 = await g.allMarket('1.3.0')
      console.log(ret2)
      assert(ret != ret2)
    },
    async test_gatewayAsset() {
      await g.unlock(account, password, 5000)
      let ret = await g.gatewayAsset()
      console.log(ret)
      assert(ret)
    },
    async test_runAll() {
      let testNames = ['loadBases', 'coin2name', 'lock', 'unlock', 'legal_currency', 'loadbase', 'get_user', 'limit_orders', 'get_market_history', 
                        'lowhigh', 'verify_code', 'register', 'cancel_order', 'limit_order_create', 'transfer', 'get_deposit', 'get_deposit_eos', 
                        'new_deposit', 'withdraw_info', 'withdraw', 'findBase', 'fillorder_history', 'queryAsset', 'genPassword', 'deposit_list', 
                        'withdraw_list', 'balances', 'assetAmount', 'asset_icon', 'checkAddress', 'tradefee', 'calAmountAndFee', 'loadConfigedAssets', 
                        'queryLocked', 'getTotalBalance', 'getDepth', 'getOpenOrder', 'getClosedOrder', 'gatewayRecord', 'assetValue', 'fake_tr_memo_fee', 
                        'top_asset', 'report', 'claim_balance', 'deposit_infos', 'withdraw_infos', 'allMarket', 'gatewayAsset']
      for (let i = 0; i < testNames.length; i++) {
        let op = 'this.test_' + testNames[i] + '()'
        try {
          await eval(op)
        } catch (err) {
          console.error('--------------------------------------')
          console.error(`${testNames[i]} failed!`)
          await g.report(`${testNames[i]} failed!`)
          console.error('--------------------------------------')
        }
      }
    },
    async test() {
      console.log('-----------------------------------------------')
      console.log('test start')
      await this.test_runAll()
      console.log('test end')
      console.log('-----------------------------------------------')

    },
    // *******************************************************
    // 这个验证码得是测试网的。
    async getcode() {
      let s = await g.verify_code();
      console.log(s);
      this.code = s.data;
      this.codeid = s.id;
    },
    // 这个注册得是测试网的账号。
    async register() {
      console.log(this.newuser, this.newpassword, this.newcode);
      try {
        let s = await g.register(
          this.newuser,
          this.newpassword,
          this.codeid,
          this.newcode
        );
        console.log("register", s);
        this.out = s;
      } catch (e) {
        console.log(3, e);
        throw(e)
      }
    },
    async getobject() {
      let s = await g.rawdb("get_objects", ["1.3.0"]);
      console.log(s);
      this.out = s;
    },
    async block() {
      let s = await g.rawdb("get_block", 10000);
      console.log(s);
      this.out = s;
    },
    async unlock() {
      let s = await g.unlock(
        "test11",//"test-summer",//"yangyutest1",
        "1111qqqqAAAA@",//"Abcd1234abcd1234",//"P5HuDhKrZsxeB3LPio8c8Kv3XNhh4cqnWj8dwnDTYordR",
        500
      );
      console.log(s);
      this.out = s.code;
    },
    async lock() {
      let s = await g.lock();
      console.log(s);
      this.out = s;
    },
    async latest_fill() {
      // base,quota 要传对
      let s = await g.order_history("1.3.23", "1.3.2", 50);
      console.log(s);
      this.out = s;
    },
    async loadbase() {
      let s = await g.loadbase("1.3.0");
      console.log(1, s);
      this.out = s;
    },
    async loadbases() {
      let s = await g.loadBases();
      console.log("loadbases", s);
      this.out = s;
    },
    async asset() {
      let s = await g.queryAsset("1.3.53");
      console.log("asset", s);
      this.out = s;
    },
    async rome_depth() {
      // 后端ROME服务目前不可用啊
      let s = await g.rome_depth("1.3.2", "1.3.0", function(data) {
        console.log(data);
      });
    },
    // 用于展示用户限价单,当前委单
    async limit_order() {
      let s = await g.limit_orders("yangyu1");
      console.log(s);
      this.out = s;
    },
    async market_history() {
      let s = await g.get_market_history(
        "1.3.23",
        "1.3.2",
        86400,
        "2018-11-27T09:00:14",
        "2018-11-29T09:20:30"
      );
      console.log(s);
      /**
       * {
          "id": "5.1.73848",
          "key": {
            "base": "1.3.0",
            "quote": "1.3.2",
            "seconds": 86400,   // 跨度秒数
            "open": "2018-05-01T00:00:00"  // 开始时间
          },
          "high_base": "5059288537",  // 时间段内最高价base量
          "high_quote": 25600000,   // 时间段内最高价quote量
          "low_base": "3076078959",// 时间段内最低价base量
          "low_quote": 17644388,// 时间段内最低价quote量
          "open_base": 158953511, // 时间段开始base量
          "open_quote": 909198,   // 时间段开始quote量
          "close_base": 19411504, // 时间段结束base量
          "close_quote": 109400, // 时间段结束quote量
          "base_volume": "20864813249",  // 时间段内base量
          "quote_volume": 114872012  // 时间段内quote量
        }
        // base量 / quote量 是价格。
       */
      this.out = s;
    },
    async fill_order_history() {
      let s = await g.fillorder_history(
        "test1",
        "2018-11-01T00:00:00",
         "2018-12-08T06:00:00",
        0,
        10,
        // "1.3.0",
        // "1.3.2"
      );
      console.log(s);
      this.out = s;
    },
    async get_user() {
      let s = await g.get_user("yangyu1");
      if (s) {
        console.log(s);
        this.out = s;
      } else {
        alert("不存在这个用户");
      }
    },
    async depositlist(){
      this.out = "";
      let s = await g.deposit_list()
      console.log("d", s);
      this.out = s;
    },
    async withdrawlist(){
      this.out = "";
      let s = await g.withdraw_list()
      console.log("d", s);
      this.out = s;
    },
    async deposit() {
      let s = await g.get_deposit("EOS1", "yangyutest1");
      if (s.data.getDepositAddress) {
        console.log(s.data.getDepositAddress);
        this.out = s;
      } else {
        console.error(s);
      }
    },
    async refresh_deposit(){
      let s = await g.new_deposit("EOS", "yangyutest1");
      if (s.data.newDepositAddress) {
        console.log(s.data.newDepositAddress);
        this.out = s;
      } else {
        console.error(s);
      }
    },
    async depositEOS(){
      let s = await g.get_deposit_eos( "yangyu1");
      if (s.data.getDepositAddress) {
        console.log(s.data.getDepositAddress);
        this.out = s;
      } else {
        console.error(s);
      }
    },
    async withdraw_info() {
      // 因为只有测试网关可用
      // 提现信息，这里只能传测试链的数据

      let s = await g.withdraw_info("EOS");
      console.log(s);
      this.out = s;
    },
    async withdraw() {
      // 需要在cybex_help.js 中将 NODE_LIST 改成测试链才能使用
      let s = await g.withdraw(
        "ETH",
        "TEST.ETH",
        0.1,
        "0xC3ABEBBAEf594f9ceCa420e3Bad4a45D457f60fa",
        // "1.3.3"
      );
      console.log(s);
      this.out = s;
    },
    async transfer() {
      // 需要在cybex_help.js 中将 NODE_LIST 改成测试链才能使用
      let s = await g.transfer({
        to: "yangyu123",
        amount: 0.01,
        asset: "CYB",
        memo: "你好",
        pre:true
      });
      console.log(s);
      this.out = s;
    },
    async lowhigh() {
      // 需要在cybex_help.js 中将 NODE_LIST 改成测试链才能使用
      this.out = "";
      try {
        let s = await g.lowhigh("1.3.27", "1.3.0");
        console.log(s);
        this.out = s;
      } catch (e) {
        console.error(e);
      }
    },
    async legal_currency() {
      this.out = "";
      let s = await g.legal_currency();
      console.log(s);
      this.out = s;
    },
    async cancel_order() {
      this.out = "";
      let s = await g.cancel_order(this.order.order_id);
      console.log(s);
      this.out = s;
    },
    async createtrade() {
      this.out = "";
      let s = await g.limit_order_create(this.trade.base,this.trade.quote, this.trade.side, parseFloat(this.trade.price), parseFloat(this.trade.amount),"1.3.23");
      console.log("d", s);
      this.out = s;
    },
    async genPassword(){
      this.out = "";
      let s = await g.genPassword()
      console.log("d", s);
      this.out = s;
    }
  },
  async mounted() {
    // throw new Error("sentry test")
    await g.start();
    g.store = this.$store;
    window.g = g;
    // this.test();
    setInterval(() => this.test(), 1000 * 60 * 60 * 2);
  },
  async beforeDestroy() {
    console.log('to destroy')
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>

