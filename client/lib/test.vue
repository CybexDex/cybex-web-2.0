<template>
  <div>
    <section class="container">
      <div>
        <p>
          <span @click="getcode" v-html="code"/>
          <!-- <span v-html="testhtml"/> -->
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
          <v-flex xs2>
            <v-text-field label="资产" v-model="assetObj.asset_id_or_name"/>
          </v-flex>
          <v-flex xs2 offset-xs1>
            <v-btn color="success" @click="asset_info">资产信息</v-btn>
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
          <v-btn color="success" @click="getobject">get object</v-btn>
          <v-btn color="success" @click="block">block</v-btn>
          <v-btn color="success" @click="unlock">unlock</v-btn>
          <v-btn color="success" @click="lock">lock</v-btn>
          <v-btn color="success" @click="latest_fill">最近成交</v-btn>
          <v-btn color="success" @click="loadbase">交易行情</v-btn>
          <v-btn color="success" @click="loadbases">所有交易对</v-btn>
          <v-btn color="success" @click="asset">资产</v-btn>
          <v-btn color="success" @click="rome_depth">rte交易深度</v-btn>
          <v-btn color="success" @click="limit_order">limit_order</v-btn>
          <v-btn color="success" @click="market_history">k线</v-btn>
          <v-btn color="success" @click="fill_order_history">trade history</v-btn>
          <v-btn color="success" @click="get_user">用户信息</v-btn>
          <v-btn color="success" @click="withdraw_info">提现信息</v-btn>
          <v-btn color="success" @click="deposit">充值地址获取</v-btn>
          <v-btn color="success" @click="refresh_deposit">充值地址刷新</v-btn>
          <v-btn color="success" @click="depositEOS">EOS充值地址获取</v-btn>
          <v-btn color="success" @click="withdraw">提现</v-btn>
          <v-btn color="success" @click="transfer">转账</v-btn>
          <v-btn color="success" @click="lowhigh">24小时最低最高</v-btn>
          <v-btn color="success" @click="legal_currency">法币价格</v-btn>
          <v-btn color="success" @click="genPassword">建议密码</v-btn>
          <v-btn color="success" @click="depositlist">充值列表</v-btn>
          <v-btn color="success" @click="withdrawlist">提现列表</v-btn>
        </p>
        <p>{{ out }}</p>
      </div>
    </section>
    <div class="icon-examples" style="text-align:left">
      <div v-for="(icon, index) of iconVars" :key="index">
        <span style="font-size: 24px" :class="icon"/>
        {{ icon }}
      </div>
    </div>
  </div>
</template>
<script>
import { g } from "./cybex_help";
// import order_ws from "./order_node"
export default {
  components: {},
  data() {
    return {
      iconVars: [
        "ic-settings",
        "ic-search",
        "ic-star",
        "ic-info",
        "ic-candle",
        "ic-balance_wallet",
        "ic-cancel",
        "ic-arrow_drop_down",
        "ic-chevron_right",
        "ic-chevron_left",
        "ic-logout",
        "ic-wallet_address",
        "ic-deposit",
        "ic-address",
        "ic-send",
        "ic-refresh",
        "ic-copy",
        "ic-first_page",
        "ic-last_page",
        "ic-help",
        "ic-error",
        "ic-correct",
        "ic-records",
        "ic-feedback",
        "ic-arrow_up",
        "ic-alarm_white",
        "ic-arrow_down_red",
        "ic-arrow_drop_down_orange",
        "ic-arrow_drop_down_white",
        "ic-arrow_drop_up_orange",
        "ic-arrow_right",
        "ic-arrow_up_green ",
        "ic-avatar_error",
        "ic-avatar",
        "ic-close",
        "ic-check_box",
        "ic-drag-vertical",
        "ic-facebook",
        "ic-instagram",
        "ic-medium",
        "ic-twitter",
        "ic-telegram",
        "ic-visibility_off",
        "ic-visibility_on",
        "ic-lock_error",
        "ic-lock_outline",
        "ic-lock_tab",
        "ic-unlock_tab",
        "ic-pincode",
        "ic-pincode_error"
      ],
      code: "",
      codeid: "",
      newuser: "",
      newcode: "",
      newpassword: "",
      out: "",
      order: {},
      trade: {},
      assetObj: {},
      testhtml: '1dasd<a href="http://www.baidu.com">welcome</a>'
    };
  },
  head() {
    return {
      title: this.$t("title.index")
    };
  },
  methods: {
    async yoyoTest(){

    },
    // 这个验证码得是测试网的。
    async asset_info() {
      if (this.assetObj.asset_id_or_name) {
        console.log(this.assetObj.asset_id_or_name);
        let s = await g.queryAsset(this.assetObj.asset_id_or_name);
        console.log(s);
        this.out = s;
      }
    },
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
        throw e;
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
        "yangyu123", //"test-summer",//"yangyutest1",yangyu123
        "P5KNfAPu82LyAuJeD7NwgggWJvqZ9UREUpXQCwCNdGp8z", //"Abcd1234abcd1234",//"P5HuDhKrZsxeB3LPio8c8Kv3XNhh4cqnWj8dwnDTYordR",P5KNfAPu82LyAuJeD7NwgggWJvqZ9UREUpXQCwCNdGp8z
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
        10
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
    async depositlist() {
      this.out = "";
      let s = await g.deposit_list();
      console.log("d", s);
      this.out = s;
    },
    async withdrawlist() {
      this.out = "";
      let s = await g.withdraw_list();
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
    async refresh_deposit() {
      let s = await g.new_deposit("EOS", "yangyutest1");
      if (s.data.newDepositAddress) {
        console.log(s.data.newDepositAddress);
        this.out = s;
      } else {
        console.error(s);
      }
    },
    async depositEOS() {
      let s = await g.get_deposit_eos("yangyu1");
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
        "NASH",
        "JADE.NASH",
        100,
        "0xC3ABEBBAEf594f9ceCa420e3Bad4a45D457f60fa"
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
        pre: true
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
      let s = await g.limit_order_create(
        this.trade.base,
        this.trade.quote,
        this.trade.side,
        parseFloat(this.trade.price),
        parseFloat(this.trade.amount),
        "1.3.23"
      );
      console.log("d", s);
      this.out = s;
    },
    async genPassword() {
      this.out = "";
      let s = await g.genPassword();
      console.log("d", s);
      this.out = s;
    },
    async test() {
      let icon_url = await g.asset_icon("1.3.0");
      await g.loadBases();
      await this.unlock();
      // await this.market_history()
      // await this.withdraw()
      // console.log("cancel_order",(await g.cancel_order("1.7.111")))
      // console.log(
      //   "trade",
      //   await g.limit_order_create("1.3.23", "1.3.2", "buy", "1", "1", "1.3.23")
      // );
      // console.log("icon url",icon_url)
      // console.log("coin id 2 name",(await g.coin_id2name()))
      // //balance
      // setInterval(async ()=>{
      //    await g.getDepth("1.3.23","1.3.2",2,22)
      //   },3000)
      // setInterval(async ()=>{
      //   console.log(1,g.check_service("node"),g.check_service("mdp"))
      // },2000)
      // console.log("all_status",g.all_status())
      // console.log("loadConfigedAssets",(await g.loadConfigedAssets()))
      // console.log("frozenBalances",(await g.frozenBalances("yangyutest1")))
      console.log("balance 1.3.0", await g.balances("yangyu123"));
      // console.log("balance 1.3.3332",(await g.balances("yangyu1","1.3.3332")))
      // console.log("check addr",(await g.checkAddress("ETH","wrong-account","0xC3ABEBBAEf594f9ceCa420e3Bad4a45D457f60fa")))
      // console.log("trade fee",(await g.tradefee("yyy","1.3.2")))
      // console.log("calAmountAndFee",JSON.stringify((await g.calAmountAndFee("yangyutest1",100,"EOS","ddd[dd]"))))
      // console.log("assetValue",JSON.stringify((await g.assetValue("USDT",307,null))))
      // console.log("queryLocked",JSON.stringify((await g.queryLocked())))
      console.log(
        "getTotalBalance",
        JSON.stringify(await g.getTotalBalance("yangyu123"))
      );
      // console.log("getDepth",JSON.stringify((await g.getDepth("1.3.27","1.3.2",2,22))))
      // console.log("app_pairs",(await g.app_pairs()))
      // setTimeout(async ()=>{
      //   let x = await g.stopDepth()
      // },10000)
      // setInterval(async ()=>{
      //   console.log("depth")
      //   let x = await g.getDepth("1.3.23","1.3.2",4,22)
      //   console.log(x)
      // },500)
      //  console.log("getOpenOrder",JSON.stringify((await g.getOpenOrder("test-summer"))))
      //  console.log("getOpenOrder",JSON.stringify((await g.getOpenOrder("yangyutest1","1.3.0","1.3.2"))))
      //  console.log("getClosedOrder",JSON.stringify((await g.getClosedOrder("test-summer","2018-11-060T08:00:00","2018-12-08T00:00:00",10,"1.7.510926","1.3.0","1.3.52"))))
      // await this.unlock()
      // console.log("gatewaylogin",JSON.stringify((await g.gatewaylogin(60*10))))
      //  console.log("gatewayRecord",JSON.stringify((await g.gatewayRecord())))
      //  console.log("gatewayAsset",JSON.stringify((await g.gatewayAsset())))

      //  console.log("ticker",JSON.stringify((await g.ticker("1.3.23","1.3.2"))))
      //   console.log("fake_tr_memo_fee",JSON.stringify((await g.fake_tr_memo_fee())))
      // console.log("fake_tr_memo_fee",JSON.stringify((await g.fake_tr_memo_fee("欢迎你"))))
      // console.log("top_asset",JSON.stringify((await g.top_asset())))
      //  console.log("claim_balance",JSON.stringify((await g.claim_balance("1.15.130","1.3.0","10000"))))
      // console.log("deposit_infos",JSON.stringify((await g.deposit_infos("1.3.2"))))
      //  console.log("withdraw_infos",JSON.stringify((await g.withdraw_infos("1.3.3"))))
      // console.log("allMarket",JSON.stringify((await g.allMarket())))
      console.log(
        "chainDepth",
        JSON.stringify(await g.chainDepthCache("ETH", "CYB", 6))
      );
    }
  },
  async mounted() {
    // await g.start()
    g.store = this.$store;
    await this.getcode();
    // await this.unlock()
    // g.report(new Error("cool"),"mounted")
    await this.test();
    window.g = g;
  }
};
</script>

<style scoped>
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

