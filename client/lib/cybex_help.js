let {
  Apis
} = require('cybexjs-ws')
var _ = require('lodash')
let axios = require('axios')
let moment = require('moment')
const BigNumber = require('bignumber.js');
import cached from './cache.js'
import rte from './rte.js'
import status from './status.js'
import config from './config/config.js'
import {
  promisify,
  random_id,
  throw_err,
  selectNode
} from './utils'
import order_ws from "./order_node"
window.VERSION = process.env.VERSION
let log = function (...args) {
  // console.log("cybexhelp:", ...args)
}

function sumByPre(arr, name) {
  let a = new BigNumber(0)
  for (let x of arr) {
    a = a.plus(new BigNumber(x[name]))
  }
  return a.toNumber()
}
_.mixin({
  'sumByPre': sumByPre
});
let sentry
if (config.sentry.enable) {
  sentry = require('@sentry/browser')
  sentry.init({
    dsn: config.sentry.dns,
    environment: config.error.pre
    // ...
  });
  let browser_id = localStorage.getItem("browser_id")
  if (!browser_id) {
    browser_id = random_id()
    localStorage.setItem("browser_id", browser_id)
  }
  sentry.configureScope((scope) => {
    scope.setTag("browser_id", browser_id)
  });
  log("sentry inited")
}
// log("config", config)
let err_pre = config.error.pre + "."
var {
  TransactionBuilder,
  Aes,
  TransactionHelper,
  key,
  ops,
  Signature,
  PrivateKey
} = require("cybexjs")
let _keyCachePriv = {}
let _keyCachePub = {}
const NODE_LIST = config.NODE_LIST
let appconfig = config.appconfig
let rte_err_num = 0
class Cybex {
  constructor(NODELIST) {
    this.currentNode = ''
    this.connect_status = 'off'
    this.startCbs = []
    this.userkeys = null
    this.user = null
    this.bases = {}
    this.store = null
    this.keytimer = null
    this.name2idDic = null
    this.NODELIST = NODELIST
    this.start = promisify(_.partial(this.start_cb, this))
  }
  start_cb(self, cb) {
    log("start check connect_status", self.connect_status)
    if (self.connect_status === "on") {
      cb(null, null)
      return
    }
    if (self.connect_status === "ing") {
      self.startCbs.push(cb)
    } else {
      log('start check cybex node')
      self.init_node(self.NODELIST, cb)
    }
  }
  async init_node(NODE_LIST, cb) {
    this.connect_status = "ing"
    this.startCbs.push(cb)
    try {
      const bestNode = await selectNode(NODE_LIST)
      await this.doConnect(bestNode)
    } catch (e) {
      console.error(e)
      log("try reconnect")
      this.connect_status = "off"
      setTimeout(this.start.bind(this), 5000)
    }
  }
  sentry_user(username) {
    if (username) {
      if (config.sentry.enable) {
        sentry.configureScope((scope) => {
          scope.setUser({
            "username": username
          })
        });
      }
    }
  }
  async start2() {
    log('start check cybex node')
    if (this.connect_status === "on") {
      return
    }
    try {
      const bestNode = await this.selectNode(this.NODELIST)
      await this.doConnect(bestNode)
    } catch (e) {
      setTimeout(this.start.bind(this), 5000)
    }
  }
  // 状态改变回调
  onConnectionStatusChanged(self, status) {
    log('TCP链路状态变化：', status)
    if (status === 'closed') {
      self.connect_status = "off"
      self.store && self.store.commit('exchange/SET_CONNECT', false)
      log('节点：断开', this.currentNode)
      self.start.bind(self)()
    } else if (status === 'open') {
      self.currentNode = this.ws.url
      log('成功连接节点：', self.currentNode)
    }
  }
  // msg = {"name":"xxx",args:[]}
  async report(e, caller = "") {
    //
    if (config.sentry.enable) {
      e.message = `${caller}:${e.message}`
      sentry.captureException(e)
    }
  }
  async doConnect(cs) {
    log("doConnect")
    Apis.setRpcConnectionStatusCallback(_.partial(this.onConnectionStatusChanged, this))
    // Apis.setAutoReconnect(true)
    let self = this
    return new Promise(function (resolve, reject) {
      let Instance = Apis.instance(cs, true)
      Instance.init_promise.then(async (res) => {
        self.connect_status = "on"
        Instance.ws_rpc.ws.addEventListener('close', async (e) => {
          console.error("node ws closed")
        })
        await self.initName2ID()
        self.store && self.store.commit('exchange/SET_CONNECT', true)
        if (self.startCbs.length > 0) {
          for (let cb of self.startCbs) {
            cb(null, null)
          }
          self.startCbs = []
        }
        resolve()
      })
    })
  }
  async rawhistory(apiName, ...args) {
    status.call_service("node", 10)
    if (this.connect_status !== "on") {
      await this.start()
    }
    if (!Apis.instance().history_api()) {
      console.error('')
    }
    try {
      let result = await Apis.instance()
        .history_api()
        .exec(apiName, args);
      status.back_service("node", 10)
      return result
    } catch (e) {
      console.error(e)
      if (e.message.includes("websocket state")) {
        this.start()
        throw new Error(err_pre + "s.node.history_api")
      }
    }
  }
  async raworder(apiName, ...args) {
    let s = await order_ws.raworder(apiName, ...args)
    return s
  }
  async raworder1(apiName, ...args) {
    if (this.connect_status !== "on") {
      await this.start()
    }
    if (!Apis.instance().limit_api()) {
      console.error('')
    }
    try {
      let result = await Apis.instance()
        .limit_api()
        .exec(apiName, args);
      return result
    } catch (e) {
      console.error(e)
      if (e.message.includes("websocket state")) {
        throw new Error(err_pre + "s.node.limit_api")
      }
    }
  }
  check_service(name) {
    return status.status(name)
  }
  async rawdb(apiName, ...args) {
    status.call_service("node", 10)
    if (this.connect_status !== "on") {
      await this.start()
    }
    if (!Apis.instance().db_api()) {
      console.error('')
    }
    try {
      let result = await Apis.instance()
        .db_api()
        .exec(apiName, args);
      status.back_service("node", 10)
      return result
    } catch (e) {
      console.error(e)
      if (e.message.includes("websocket state")) {
        this.start()
        throw new Error(err_pre + "s.node.db_api")
      }
    }
  }
  async loadBases() {
    let s = await Promise.all(appconfig.bases.map(async (i) => {
      let c = await this.queryAsset(i)
      return g.loadbase_config(c.id)
    }))
    s = _.keyBy(s, 'base')
    this.bases = s
    //
    // this.store && this.store.commit('user/setBases', s)
    config.whitePairs = this.whitePairs()
    return s
  }
  whitePairs() {
    if (!this.bases) {
      return
    }
    let pairs = []
    for (let base in this.bases) {
      let ps = this.bases[base]["data"].map(i => [base, i])
      pairs = pairs.concat(ps)
    }
    return pairs
  }
  realDiv(one,two){
    return BigNumber(one).dividedBy(two).toNumber()
  }
  async order2Open(orders) {
    let msg = orders
    let x = await Promise.all(msg.map(async (i) => {
      let base_id = await this.findBase(i.key.asset1, i.key.asset2)
      let base, quote
      let asset2 = {
        asset: i.key.asset2
      }
      let asset1 = {
        asset: i.key.asset1
      }
      if (base_id === i.key.asset1) {
        base = asset1
        quote = asset2
      } else {
        quote = asset1
        base = asset2
      }
      if (i.is_sell) {
        asset2.amount = i.min_to_receive
        asset1.amount = i.amount_to_sell
        asset1.is_sell = true
        asset2.is_sell = false
      } else {
        asset2.amount = i.amount_to_sell
        asset1.amount = i.min_to_receive
        asset1.is_sell = false
        asset2.is_sell = true
      }

      let quoteNum = await this.assetAmount(quote.asset, quote.amount)
      let baseNum = await this.assetAmount(base.asset, base.amount)
      let price = this.realDiv(baseNum,quoteNum)
      let filled
      if (quote.is_sell) {
        filled = this.realDiv(i.sold,i.amount_to_sell)
      } else {
        filled = this.realDiv(i.received,i.min_to_receive) 
      }
      // let filled = i.sold / i.amount_to_sell
      // let filled = i.recevied / i.min_to_receive
      let s = {
        id: i.order_id,
        time: i.create_time,
        tradetype: base.is_sell ? "buy" : "sell",
        market: {
          base: base.asset,
          quote: quote.asset
        },
        price: price,
        amount: quoteNum,
        filled: filled,
        total: baseNum
      }
      return s
    }))
    return x
  }
  async order2Close(orders) {
    let msg = orders
    // log(orders)
    let x = await Promise.all(msg.map(async (i) => {
      let base_id = await this.findBase(i.key.asset1, i.key.asset2)
      let base, quote
      let asset2 = {
        asset: i.key.asset2
      }
      let asset1 = {
        asset: i.key.asset1
      }
      if (base_id === i.key.asset1) {
        base = asset1
        quote = asset2
      } else {
        quote = asset1
        base = asset2
      }
      if (i.is_sell) {
        asset2.amount = i.min_to_receive
        asset2.fill_amount = i.received
        asset1.amount = i.amount_to_sell
        asset1.fill_amount = i.sold
        asset1.is_sell = true
        asset2.is_sell = false
      } else {
        asset2.amount = i.amount_to_sell
        asset2.fill_amount = i.sold
        asset1.amount = i.min_to_receive
        asset1.fill_amount = i.received
        asset1.is_sell = false
        asset2.is_sell = true
      }
      let quoteNum = await this.assetAmount(quote.asset, quote.amount)
      let baseNum = await this.assetAmount(base.asset, base.amount)
      let quotefill = await this.assetAmount(quote.asset, quote.fill_amount)
      let basefill = await this.assetAmount(base.asset, base.fill_amount)
      let average = quotefill > 0 ? basefill / quotefill : null
      let price = this.realDiv(baseNum,quoteNum)
      // let filled = i.sold/i.amount_to_sell
      let status = "Canceled"
      if (i.received >= i.min_to_receive) {
        status = "Filled"
      }
      let s = {
        id: i.order_id,
        time: i.create_time,
        tradetype: base.is_sell ? "buy" : "sell",
        market: {
          base: base.asset,
          quote: quote.asset
        },
        price: price,
        amount: quoteNum,
        filled: quotefill,
        total: basefill,
        // total: baseNum,
        average: average,
        status: status
      }
      return s
    }))
    return x
  }
  async getClosedOrder(user_id, start, end, limit, lastid, base_id, quote_id, white_flag) {
    if (lastid) {
      limit = limit + 1
    }
    let r
    if (appconfig.dataserver_disable) {
      r = await this.getClosedOrderLocal(user_id, start, end, limit, lastid, base_id, quote_id, white_flag)
    } else {
      r = await this.getClosedOrderServer(user_id, start, end, limit, lastid, base_id, quote_id)
    }
    if (lastid && r.length >= 1) {
      r.shift()
    }
    return r
  }
  async getClosedOrderLocal(user_id, start, end, limit, lastid, base_id, quote_id, white_flag) {
    let u = (await this.get_user_fixed(user_id))[1]
    limit = limit || 20
    lastid = lastid || ""
    if (!end) {
      end = moment.utc().format("YYYY-MM-DDTHH:mm:ss")
    }
    let s
    if (!lastid) {
      let t = await this.raworder("get_limit_order_id_by_time", end)
      lastid = t
    }
    if (base_id) {
      s = await this.raworder("get_market_limit_order_status", u.account.id, base_id, quote_id, lastid, limit)
    } else if (white_flag) {
      s = await order_ws.get_filtered_limit_order_status(u.account.id,
        lastid,
        limit, white_flag)
      if (!s) {
        throw_err("S.filtered_limit_order_status")
      }
    }
    else {
      s = await this.raworder("get_limit_order_status", u.account.id, lastid, limit)
    }
    let x = await this.order2Close(s)
    if (x.length > 0 && x[0].time > end) {
      return []
    }
    if (start) {
      x = x.filter(i => i.time > start)
    }
    return x
  }
  async getClosedOrderServer(user_id, start, end, limit, lastid, base_id, quote_id) {
    let u = (await this.get_user_fixed(user_id))[1]
    limit = limit || 20
    lastid = lastid || ""
    if (!end) {
      end = moment.utc().format("YYYY-MM-DDTHH:mm:ss")
    }
    let url = `${appconfig.dataserver}/v1/order/closed?user=${u.account.id}&base=${base_id || ""}&quote=${quote_id || ""}&end=${end}&limit=${limit}&lastid=${lastid}`
    try {
      let hr = await axios.get(url);
      if (hr.status == 200 && hr.data.code === 0) {
        let msg = hr.data.message
        let x = await this.order2Close(msg)
        if (x.length > 0 && x[0].time > end) {
          return []
        }
        if (start) {
          x = x.filter(i => i.time > start)
        }
        return x
      }
    } catch (e) {

    }
    return null
  }
  async getOpenOrder(user_id, base_id, quote_id) {
    if (appconfig.dataserver_disable) {
      return await this.getOpenOrderLocal(user_id, base_id, quote_id)
    } else {
      return await this.getOpenOrderServer(user_id, base_id, quote_id)
    }
  }
  async getOpenOrderLocal(user_id, base_id, quote_id) {
    let u = (await this.get_user_fixed(user_id))[1]
    let s
    if (base_id) {
      s = await this.raworder("get_opened_market_limit_order_status", u.account.id, base_id, quote_id)
    } else {
      s = await this.raworder("get_opened_limit_order_status", u.account.id)
    }
    return await this.order2Open(s)
  }
  async getOpenOrderServer(user_id, base_id, quote_id) {
    let u = (await this.get_user_fixed(user_id))[1]
    let url = `${appconfig.dataserver}/v1/order/open?user=${u.account.id}&base=${base_id || ""}&quote=${quote_id || ""}`
    try {
      let hr = await axios.get(url);
      if (hr.status == 200 && hr.data.code === 0) {
        let msg = hr.data.message
        let x = await this.order2Open(msg)
        return x
      }
    } catch (e) {
      console.error(e)
    }
    return null
  }
  async getDepthRome(base_id, quote_id, precision, num) {
    let base = await this.queryAsset(base_id)
    let quote = await this.queryAsset(quote_id)
    let market = quote.symbol.replace(".", "_") + base.symbol.replace(".", "_")
    let msgobj = await rte.depth(num, precision, market)
    return _.pick(msgobj, ["asks", "bids", "time", "price"])
  }
  async getDepth(base_id, quote_id, precision, num) {
    let re
    if (!config.Use_RTE || rte_err_num > 3) {
      re = await this.chainDepthCache(base_id, quote_id, precision, num)
      log("depth", re)
      return re
    }
    if (appconfig.dataserver_disable) {
      try {
        re = await this.getDepthRome(base_id, quote_id, precision, num)
        if (!re.price) {
          let t = await this.ticker(base_id, quote_id)
          re.price = t.latest
        }
      } catch (e) {
        re = null
      }
      if (re == null || !re.bids) {
        rte_err_num = rte_err_num + 1
      }
    } else {
      re = await this.getDepthServer(base_id, quote_id, precision, num)
    }
    log("depth", re)
    return re
  }
  // 链上获取
  async chainDepthCache(base_id, quote_id, precision = 3, num = 10, cache = 3) {
    let self = this
    async function s() {
      let x = await self.chainDepth(base_id, quote_id, precision, num)
      return x
    }
    let m = await cached('chainDepth' + base_id + quote_id + precision + num, s, false, cache)
    return m
  }
  async chainDepth(base_id, quote_id, precision = 3, num = 10) {
    // let self = this
    let base = await this.queryAsset(base_id)
    let quote = await this.queryAsset(quote_id)
    let [s, t] = await Promise.all([this.rawdb("get_limit_orders", base.id, quote.id, 300), this.ticker(base.id, quote.id)])
    let x = await Promise.all(s.map(async (o) => {
      //sell,or buy 
      let side, order_quote, order_base, price
      if (o.sell_price.base.asset_id === quote.id) {
        side = "asks"
        order_quote = o.sell_price.base
        order_base = o.sell_price.quote
      } else {
        side = "bids"
        order_quote = o.sell_price.quote
        order_base = o.sell_price.base
      }
      // price
      let q = await this.assetAmount(order_quote.asset_id, order_quote.amount)
      let b = await this.assetAmount(order_base.asset_id, order_base.amount)
      price = b * 1.0 / q
      if (side === "asks") {
        q = await this.assetAmount(order_quote.asset_id, o.for_sale)
        b = (q * price).toFixed(base.precision)
        price = _.ceil(price, precision)
      } else {
        b = await this.assetAmount(order_base.asset_id, o.for_sale)
        q = (b / price).toFixed(quote.precision)
        price = _.floor(price, precision)
      }
      return {
        side,
        price,
        q,
        b
      }
    }))
    let asks = _.filter(x, i => i.side === "asks")
    asks = _(asks).groupBy("price").values().map(p_arr => {
      let q_s = _.sumByPre(p_arr, "q")
      let b_s = _.sumByPre(p_arr, "b")
      return {
        side: "asks",
        price: p_arr[0].price,
        q: q_s,
        b: b_s
      }
    }).sortBy("price").slice(0, num).value()
      .map(i => {
        return [i.price, i.q, i.b]
      })

    let bids = _.filter(x, i => i.side === "bids")
    bids = _(bids).groupBy("price").values().map(p_arr => {
      let q_s = _.sumByPre(p_arr, "q")
      let b_s = _.sumByPre(p_arr, "b")
      return {
        side: "bids",
        price: p_arr[0].price,
        q: q_s,
        b: b_s
      }
    }).sortBy("price").reverse().slice(0, num).value()
      .map(i => {
        return [i.price, i.q, i.b]
      })
    return {
      asks: asks,
      bids: bids,
      price: t.latest
    }
  }
  async stopDepth() {
    rte.stopDepth()
  }
  async getDepthServer(base_id, quote_id, precision, num) {
    let base = await this.queryAsset(base_id)
    let quote = await this.queryAsset(quote_id)
    let market = quote.symbol.replace(".", "_") + base.symbol.replace(".", "_")
    let url = `${appconfig.dataserver}/v1/order/depth?num=${num}&p=${precision}&market=${market}`
    try {
      let hr = await axios.get(url);
      if (hr.status == 200 && hr.data.code === 0) {
        let msg = hr.data.message
        if (msg === "") {
          return {}
        }
        let msgobj = JSON.parse(msg)
        // log(msgobj)
        return _.pick(msgobj, ["asks", "bids", "time"])
      }
    } catch (e) {

    }
    return null
  }
  async initName2ID() {
    let self = this
    async function s1() {
      let s = await self.loadConfigedAssets()
      let dic = {}
      for (let k of s) {
        let basename = ((await self.queryAsset(k)) || {}).symbol
        if (!basename) {
          console.error("initName2ID", k)
        } else if (basename.indexOf(appconfig.gatewayUser.asset_prefix) === 0) {
          basename = basename.slice(appconfig.gatewayUser.asset_prefix.length)
          dic[basename] = k
        } else {
          // dic[basename] = k
        }
      }
      log(1, JSON.stringify(dic))
      self.name2idDic = dic
      return dic
    }
    const result = await cached('initName2ID', s1, false, 60 * 60 * 10)
    return result
  }
  async loadConfigedAssets() {
    let url = `${appconfig.appserver}/json/assets.json`
    try {
      let hr = await axios.get(url);
      if (hr.status == 200) {
        return hr.data
      }
    } catch (e) {

    }
    return null
  }
  async coin_id2name() {
    let s = await this.loadConfigedAssets()
    let dic = {}
    for (let k of s) {
      let basename = ((await this.queryAsset(k)) || {}).symbol
      dic[k] = basename
    }
    log(JSON.stringify(dic))
    return dic
  }
  async fee_assets() {
    let s = await this.loadConfigedAssets()
    let dic = {}
    for (let k of s) {
      let basename = ((await this.queryAsset(k)) || {})
      if (basename.options.market_fee_percent > 0) {
        dic[k] = basename
      }
    }
    log(JSON.stringify(dic))
    return Object.keys(dic)
  }
  async buildTransfer(txObj, keys) {
    let [fromAccount] = await this.get_acct([txObj.from])
    let [toAccount] = await this.get_acct([txObj.to])
    if (!fromAccount || !toAccount) return null
    log(fromAccount)
    let memoObject
    if (txObj.memo && txObj.memo !== '') {
      let memoFromPublic = _.get(fromAccount, 'options.memo_key')
      const keypair = _.find(keys, pair => pair.pubKey === memoFromPublic) // use memoKey
      if (!keypair) {
        console.warn(`pubKey=${memoFromPublic}`, ['Failed-to-find-memo-privKey'])
        throw new Error("no_memokey")
      }
      memoObject = await g.genMemo(fromAccount, toAccount, txObj.memo, keypair.privKey)
    }
    let reObject = {
      from: fromAccount.id,
      to: toAccount.id,
      fee: {
        amount: 0,
        asset_id: '1.3.0'
      },
      amount: {
        amount: txObj.amount,
        asset_id: txObj.asset.id
      },
      memo: memoObject
    }
    if (txObj.locktime && txObj.locktime > 0) {
      reObject.extensions = [
        [1, {
          "vesting_period": txObj.locktime,
          "public_key": toAccount.active.key_auths[0][0]
        }]
      ]
    }
    return reObject
  }
  async genMemo(memoSender, memoTo, memoContent, privKey) {
    // 检查双方公钥存在
    let memoFromPublic = _.get(memoSender, 'options.memo_key')
    // The 1s are base58 for all zeros (null)
    if (/111111111111111111111/.test(memoFromPublic)) {
      memoFromPublic = null
    }
    let memoToPublic = _.get(memoTo, 'options.memo_key')
    if (/111111111111111111111/.test(memoToPublic)) {
      memoToPublic = null
    }
    if (!memoFromPublic || !memoToPublic) return undefined

    let nonce = TransactionHelper.unique_nonce_uint64()
    return {
      from: memoFromPublic,
      to: memoToPublic,
      nonce,
      message: Aes.encrypt_with_checksum(privKey, memoToPublic, nonce, Buffer.from(memoContent, 'utf-8'))
    }
  }
  userReadMemo(memoObj) {
    let key = this.findMemokey()
    console.log('$$$$$ userReadMemo', key)
    if (key) {
      try {
        let pubkey
        if (key.pubKey === memoObj.to) {
          pubkey = memoObj.from
        } else {
          pubkey = memoObj.to
        }
        let s = this.readMemo(memoObj.nonce, memoObj.message, key.privKey, pubkey)
        return s
      } catch (e) {
        console.error(e)
        throw_err("wrong_memokey")
      }
    }
    return "***"
  }
  readMemo(nonce, message, privKey, publicKey) {
    // console.log(publicKey)
    let s = Aes.decrypt_with_checksum(privKey, publicKey, nonce, message)
    return s.toString()
  }
  generateKeys(accountName, password, roles, prefix) {
    if (!accountName || !password) {
      throw new Error("Account name or password required");
    }
    if (password.length < 12) {
      throw new Error("Password must have at least 12 characters");
    }

    let privKeys = {};
    let pubKeys = {};

    (roles || ["active", "owner", "memo"]).forEach(role => {
      let seed = accountName + role + password;
      let pkey = _keyCachePriv[seed] ? _keyCachePriv[seed] : PrivateKey.fromSeed(seed);
      _keyCachePriv[seed] = pkey;
      // console.log(role,seed,pkey.toWif(),pkey.toHex())
      privKeys[role] = pkey;
      pubKeys[role] = _keyCachePub[seed] ? _keyCachePub[seed] : pkey.toPublicKey().toString(prefix);

      _keyCachePub[seed] = pubKeys[role];
    });

    return {
      privKeys,
      pubKeys
    };
  }
  async geneForKeys(accts) {
    let result = []
    for (let acct of accts) {
      const res = this.generateKeys(acct.user, acct.password)
      // cybexKeys[0]为active
      result.push({
        privKey: res.privKeys.active,
        pubKey: res.pubKeys.active
      })
      // cybexKeys[1]为owner
      result.push({
        privKey: res.privKeys.owner,
        pubKey: res.pubKeys.owner
      })
      result.push({
        privKey: res.privKeys.memo,
        pubKey: res.pubKeys.memo
      })
    }
    return result.length > 0 ? result : null
  }
  async queryLocked() {
    if (!this.userkeys) {
      throw new Error("locked")
    }
    let addresses = _.flatMap(this.userkeys, k => {
      let addrs = key.addresses(k.pubKey)
      return addrs
    })
    let s = await this.rawdb("get_balance_objects", addresses)
    return s
  }
  async getTotalBalance(user) {
    // 计算balance,计算挂单。
    let [account] = await this.rawdb('get_full_accounts', [user], false)
    let account_all_info = account[1]
    // log(JSON.stringify(account_all_info))
    let lm = account_all_info.limit_orders
    let bs = account_all_info.balances
    log(bs, lm)
    let canuse = 0
    let all = 0
    for (let b of bs) {
      let v = await this.assetValue(b.asset_type, (await this.assetAmount(b.asset_type, b.balance)))
      log(b.asset_type, v)
      canuse += v
    }
    all = canuse
    for (let l of lm) {
      let v = await this.assetValue(l.sell_price.base.asset_id, (await this.assetAmount(l.sell_price.base.asset_id, l.for_sale)))
      log("limit_order", l.sell_price.base.asset_id, v)
      all += v
    }
    let cyb_v = await this.assetValue("1.3.0", 1)
    // 人民币价格。
    let cyb_use = canuse / cyb_v
    let cyb_num = all / cyb_v
    return [canuse, all, cyb_use, cyb_num]
  }
  async suggest_account(string) {
    try {
      let accounts = await this.rawdb('lookup_accounts', string, 15)
      console.log(accounts)
      accounts = accounts.filter(i => {
        if (i[0].indexOf(string) !== -1) {
          return true
        }
        return false
      })
      return accounts
    } catch (e) {
      return null
    }
  }
  async suggest_asset(string) { //assets 
    try {
      let [asset1, asset2] = await Promise.all([
        this.rawdb('list_assets', string, 100),
        this.rawdb('list_assets', appconfig.gatewayUser.asset_prefix + string, 100)
      ]);
      let assets = _.unionBy(asset1, asset2, "id");
      assets = assets.filter(i => {
        if (i.symbol.indexOf(string) !== -1) {
          return true
        }
        return false
      })
      assets = assets.filter(i => {
        if (i.bitasset_data_id) {
          return false
        }
        return true
      })
      return assets
    } catch (e) {
      return null
    }
  }
  async queryAsset(symbol) {
    let self = this
    async function s() {
      let x = await self.rawdb('lookup_asset_symbols',
        [symbol]
      )
      if (x[0] && x[0].id) {
        let a = x[0].symbol
        let gatewayname = a.replace(appconfig.gatewayUser.asset_prefix, "");
        x[0].gatewayname = gatewayname
        return x[0]
      }
      return null
    }
    const result = await cached('asset' + symbol, s, false, 60 * 60)
    return result
  }
  async queryAsset2(symbol) {
    let self = this
    // log('symbol', symbol)
    if (symbol.indexOf("1.3") === 0) {

    }
    else if (this.name2idDic && this.name2idDic[symbol]) {
      symbol = appconfig.gatewayUser.asset_prefix + symbol
    }
    // if (symbol.indexOf("1.3") === -1 && symbol != "CYB" && symbol.indexOf(appconfig.gatewayUser.asset_prefix) === -1) {
    //   symbol = appconfig.gatewayUser.asset_prefix + symbol
    // }
    async function s() {
      let x = await self.rawdb('lookup_asset_symbols',
        [symbol]
      )
      if (x[0] && x[0].id) {
        let a = x[0].symbol
        let gatewayname = a.replace(appconfig.gatewayUser.asset_prefix, "");
        x[0].gatewayname = gatewayname
        return x[0]
      }
      return null
    }
    const result = await cached('asset' + symbol, s, false, 60 * 60)
    return result
  }
  async assetAmount(assetid, amount) {
    let asset = (await this.queryAsset(assetid))
    return parseFloat((amount / Math.pow(10, asset.precision)).toFixed(asset.precision))
  }
  async assetAmountRaw(assetid, amount) {
    let asset = (await this.queryAsset(assetid))
    return parseInt(amount * Math.pow(10, asset.precision))
  }
  // export
  async lock() {
    this.keytimer && clearTimeout(this.keytimer)
    this.keytimer = null
    this.userkeys = null
    this.store && this.store.commit('auth/lock');
    // rawlog('locked');
  }
  async asset_icon(asset_id) {
    let name = asset_id.split(".").join("_")
    let url = `${appconfig.appserver}/icons/${name}_grey.png`
    return url
  }
  async order_history(base, quote, limit = 50) {
    // 市场最近成交
    let s = await this.rawhistory('get_fill_order_history', base, quote, limit * 2)
    s = await Promise.all(s.map(async (i) => {
      let tradetype, base_amount, quote_amount
      if (i.op.pays.asset_id === base) {
        tradetype = "buy"
        base_amount = i.op.pays.amount
        quote_amount = i.op.receives.amount
      } else {
        tradetype = "sell"
        base_amount = i.op.receives.amount
        quote_amount = i.op.pays.amount
      }
      let b_o, q_o
      if (i.op.fill_price.base.asset_id === base) {
        b_o = i.op.fill_price.base.amount
        q_o = i.op.fill_price.quote.amount
      } else {
        b_o = i.op.fill_price.quote.amount
        q_o = i.op.fill_price.base.amount
      }
      let a = await this.assetAmount(quote, quote_amount)
      let b = await this.assetAmount(base, base_amount)
      let c = await this.assetAmount(quote, q_o)
      let d = await this.assetAmount(base, b_o)
      let price = d / c
      return {
        price,
        tradetype,
        quote: a,
        base: b,
        time: i.time,
        is_maker: i.op.is_maker
      }
    }))
    return s.filter(o => !o.is_maker)
  }
  async chooseUser(user) {
    let account
    try {
      [account] = await this.rawdb('get_full_accounts', [user], false)
    } catch (e) {
      console.error(e)
      throw new Error(err_pre + "S.node.unlock")
    }
    if (!account) {
      throw new Error(err_pre + "UB.fail.unlock")
    }
    let account_info = account[1]["account"]
    this.user = account_info
    this.sentry_user(account_info.name)
  }
  async unlockKeyPairs(userkeys, username, timeout) {
    this.userkeys = userkeys
    await this.chooseUser(username)
    if (!timeout) {
      timeout = config.unlockPeriod;
    }
    console.log('timeout', timeout);
    if (timeout && !this.keytimer) {
      log("init keytimer")
      let self = this
      this.keytimer = setTimeout(() => {
        self.lock()
      }, timeout * 1000)
    }
  }
  async checkPass(user, password) {
    let isunlock = false
    let userkeys = await this.geneForKeys([{
      user: user,
      password: password
    }])
    let user_pubs = userkeys.map(i => i.pubKey)
    let account
    try {
      [account] = await this.rawdb('get_full_accounts', [user], false)
    } catch (e) {
      console.error(e)
      throw new Error(err_pre + "S.node.unlock")
    }
    if (!account) {
      throw new Error(err_pre + "UB.fail.unlock")
    }
    // this.store && this.store.commit('user/SET_NAME', account[0])
    let account_info = account[1]["account"]
    let ownerkey = account_info.owner
    let activekey = account_info.active
    let keys = ownerkey.key_auths.map(i => i[0])
    if (_.intersection(keys, user_pubs).length > 0) {
      isunlock = true
    }
    if (!isunlock) {
      let keys = activekey.key_auths.map(i => i[0])
      if (_.intersection(keys, user_pubs).length > 0) {
        isunlock = true
      }
    }
    if (isunlock) {
      return true
    }
    return false
  }
  async unlock(user, password, timeout) {
    /**
     * 生成的公钥是否出现在用户的公钥中。如果是则可以有某种权限而可以解锁。
     */
    let isunlock = false
    let userkeys = await this.geneForKeys([{
      user: user,
      password: password
    }])
    let user_pubs = userkeys.map(i => i.pubKey)
    let account
    try {
      [account] = await this.rawdb('get_full_accounts', [user], false)
    } catch (e) {
      console.error(e)
      throw new Error(err_pre + "S.node.unlock")
    }
    if (!account) {
      throw new Error(err_pre + "UB.fail.unlock")
    }
    // this.store && this.store.commit('user/SET_NAME', account[0])
    let account_info = account[1]["account"]
    let ownerkey = account_info.owner
    let activekey = account_info.active
    let keys = ownerkey.key_auths.map(i => i[0])
    if (_.intersection(keys, user_pubs).length > 0) {
      isunlock = true
    }
    if (!isunlock) {
      let keys = activekey.key_auths.map(i => i[0])
      if (_.intersection(keys, user_pubs).length > 0) {
        isunlock = true
      }
    }
    if (isunlock) {
      // 有userkeys就是解锁了
      // log(account_info)
      this.user = account_info
      this.userkeys = userkeys
      if (!timeout) {
        timeout = config.unlockPeriod;
      }
      console.log('timeout', timeout);
      if (timeout && !this.keytimer) {
        log("init keytimer")
        let self = this
        this.keytimer = setTimeout(() => {
          self.lock()
        }, timeout * 1000)
      }
      return {
        code: 0,
        userkeys: userkeys
      }
    } else {
      // this.report(new Error(err_pre+"UB.fail.unlock"))
      throw new Error(err_pre + "UB.fail.unlock")
    }
  }
  async ticker(base, quote) {
    let x = await this.rawdb('get_ticker', base, quote)
    x.base = base
    x.absolute_change = x.latest - x.latest * 1.0 / (1 + parseFloat(x.percent_change) / 100)
    return x
  }
  findWif() {
    let s = this.findActivekey()
    let wif = { wif: s.privKey.toWif(), pub: s.pubKey }
    return wif
  }
  async get_chain_id() {
    let s = await this.rawdb("get_chain_id")
    return s
  }
  /**
   * 
   * dot 积分排名 获取列表 
   */
  async getDotPointsRanking(user_name) {
    let result = await axios.get(" https://refer.cybex.io/order/", {
      params: {
        "account": user_name
      }
    });
    // console.debug('xxxxxxxxxxxxxxx: ', result);
    if (result.data.success) {
      let data = {};
      data = result.data.result;
      return data;
    }
    return 0;
  }
  /**
   * 临时解决方案 http请求币龄
   */
  async cybAgeHttp(user) {
    let self = this
    let user_id = await self.get_acct_id(user);
    let result = await axios.post("https://hongkong.cybex.io:443", {
      jsonrpc: "2.0",
      method: "get_account_token_age",
      params: [user_id],
      id: 1
    });
    if (result.data.result && result.data.result.length) {
      let config = await self.appconfig_settings()
      let data = result.data.result[0];
      let value = await self.assetAmount(data.asset, data.score)
      value = _.floor(value * (1 - config.ageRate), 0);
      rawlog('coin age', user, value)
      return value;
    }
    return 0;
  }
  async cybAge(user) {
    let self = this
    async function s() {
      let user_id = await self.get_acct_id(user)
      let s = await self.rawdb("get_account_token_age", user_id)
      let config = await self.appconfig_settings()
      if (s && s[0]) {
        let data = s[0]
        let value = await self.assetAmount(data.asset, data.score)
        value = _.floor(value * (1 - config.ageRate), 0);
        return value
      }
      return 0
    }
    const result = await cached('cybAge' + user, s, false, 30)
    return result
  }
  findActivekey() {
    if (!this.userkeys) {
      throw new Error("locked")
    }
    for (let mpub of this.user.active.key_auths) {
      if (mpub[1] < this.user.active.weight_threshold) {
        continue
      }
      let pub = mpub[0]
      const keypair = _.find(this.userkeys, pair => pair.pubKey === pub)
      if (keypair) {
        return keypair
      }
    }
    for (let mpub of this.user.owner.key_auths) {
      if (mpub[1] < this.user.owner.weight_threshold) {
        continue
      }
      let pub = mpub[0]
      const keypair = _.find(this.userkeys, pair => pair.pubKey === pub)
      if (keypair) {
        return keypair
      }
    }
    return null
  }
  findMemokey() {
    if (!this.userkeys) {
      throw new Error("locked")
    }
    let pub = this.user.options.memo_key
    const keypair = _.find(this.userkeys, pair => pair.pubKey === pub)
    console.log('$$$$$ findMemokey: ', keypair, pub, this.userkeys)
    return keypair
  }
  async gatewaylogin(seconds, refresh = false) {
    if (!this.userkeys) {
      throw new Error("locked")
    }
    async function s1() {
      let s = {
        accountName: this.user.name,
        expiration: Date.now() + seconds * 1000
      }
      const op = ops.fund_query.fromObject(s);
      let buffer = ops.fund_query.toBuffer(op);
      let key = this.findActivekey()
      if (!key) {
        throw_err("UB.keys.ActiveKeyMiss")
      }
      let signedHex = Signature.signBuffer(buffer, key.privKey).toHex();
      let hr = await axios.post(`${appconfig.gatewayQuery}/login`, {
        "op": s,
        "signer": signedHex
      });
      if (hr.status == 200) {
        return hr.data.data.signer
      }
      return null
    }
    let keyname = "signer:" + this.user.name
    const result = await cached(keyname, s1.bind(this), refresh, seconds)
    return result
  }
  async gatewayAsset(fundtype, asset_id) {
    if (!this.userkeys) {
      throw new Error("locked")
    }
    let s = await this.gatewaylogin(60)
    let query_params = {

    }
    if (fundtype) {
      query_params.fundType = fundtype
    }
    if (asset_id) {
      let asset = this.queryAsset(asset_id)
      query_params.asset = asset.symbol
    }
    let hr = await axios.get(`${appconfig.gatewayQuery}/account-assets/${this.user.name}`, {
      headers: {
        'Authorization': 'Bearer ' + s
      },
      params: query_params
    });
    if (hr.status == 200) {
      return hr.data.data
    } else {
      log("gatewayAsset error", hr.data)
    }
    return null
  }
  async gatewayRecord(offset, size, fundtype, asset_id) {
    if (!this.userkeys) {
      throw new Error("locked")
    }
    let s = await this.gatewaylogin(60)
    let query_params = {
      offset: offset || 0,
      size: size || 50,

    }
    if (fundtype) {
      query_params.fundType = fundtype
    }
    if (asset_id) {
      let asset = await this.queryAsset(asset_id)
      query_params.asset = asset.symbol
    }
    let hr = await axios.get(`${appconfig.gatewayQuery}/records/${this.user.name}`, {
      headers: {
        'Authorization': 'Bearer ' + s
      },
      params: query_params
    });
    if (hr.status == 200) {
      return hr.data.data
    } else {
      log("gatewayRecord error", hr.data)
    }
    return null
  }
  async checkAddress(coin_type, account, address) {
    if (coin_type.indexOf(appconfig.gatewayUser.asset_prefix) == 0) {
      coin_type = coin_type.slice(appconfig.gatewayUser.asset_prefix.length)
    }
    let hr = await axios.post(`${appconfig.gateway}/gateway`, {
      "operationName": "VerifyAddress",
      "variables": {
        "asset": coin_type,
        "accountName": account,
        "address": address
      },
      "query": "query VerifyAddress($asset: String!, $accountName: String!, $address: String!) {\n  verifyAddress(asset: $asset, accountName: $accountName, address: $address) {\n    valid\n    asset\n    __typename\n  }\n}\n"
    });
    if (hr.status == 200) {
      return hr.data.data.verifyAddress.valid
    }
    return null
  }
  async maker_rebate(account) {
    try {
      let url = config.rebate_url + `?account=${account}&action=maker`
      let hr = await axios.get(url);
      if (hr.status == 200) {
        return hr.data
      }
      log(hr)
    } catch (e) {
      if (e.message.includes("Network Error")) {
        throw (e)
      } else {
        throw_err("S.price.legal_currency")
      }
    }
    return {}
  }
  async coinname(coin_id) {
    let asset = await this.queryAsset(coin_id)
    // if (asset.symbol.indexOf(appconfig.gatewayUser.asset_prefix) == 0) {
    //   let x = asset.symbol.split(appconfig.gatewayUser.asset_prefix)[1]
    //   return x
    // }
    return asset.symbol
  }
  // TODO 法币价格 目前只有人民币价格
  async legal_currency() {
    async function s() {
      let url = `${appconfig.appserver}/price`
      try {
        let hr = await axios.get(url);
        if (hr.status == 200) {
          return hr.data
        }
      } catch (e) {
        if (e.message.includes("Network Error")) {
          throw (e)
        } else {
          throw_err("S.price.legal_currency")
        }
      }
      return null
    }
    const result = await cached('legal_currency', s, false, 5)
    return result
  }
  async app_pairs() {
    return await this.appserver_json("pairs.json")
  }
  async top_pairs() {
    return await this.appserver_json("marketlists.json")
  }
  async appserver_json(jsonpath) {
    async function s() {
      let url = `${appconfig.appserver}/json/${jsonpath}`
      try {
        let hr = await axios.get(url);
        if (hr.status == 200) {
          return hr.data
        }
      } catch (e) {

      }
      return null
    }
    const result = await cached('json/' + jsonpath, s, false, 60 * 5)
    return result
  }
  async load_base_market() {
    let self = this
    await Promise.all(appconfig.bases.map(async (item) => {
      let base_coin = await self.queryAsset(item)
      await self.base_market(base_coin.id)
      return item
    }))
  }
  async base_market(base_id) {
    async function s() {
      let url = `${appconfig.appserver}/market_price?base=${base_id}`
      try {
        let hr = await axios.get(url);
        if (hr.status == 200 && hr.data.code == 0) {
          return hr.data.data
        }
      } catch (e) {

      }
      return null
    }
    const result = await cached('base_market' + base_id, s, false, 5)
    return result
  }
  async loadbase_config(base_id) {
    async function s() {
      let url = `${appconfig.appserver}/market_list?base=${base_id}`
      try {
        let hr = await axios.get(url);
        if (hr.status == 200) {
          return {
            data: hr.data.data,
            base: base_id
          }
        }
      } catch (e) {

      }
      return null
    }
    const result = await cached('base' + base_id, s, false, 6000)
    return result
  }
  async sortPair(s1) {
    s1 = _.sortBy(s1, i => -parseFloat(i.base_volume))
    for (let s of s1) {
      let x = await this.coinname(s.quote)
      s.quotename = x
    }
  }
  async loadgame() {
    let quotes = await this.loadbase_config(base_id)
    if (quotes) {
      let a1 = quotes.data.map(i => this.ticker(base_id, i));
      let s1 = await Promise.all(a1)
      await this.sortPair(s1)
      return s1
    }
    return null
  }
  async loadbase(base_id) {
    let quotes = await this.loadbase_config(base_id)
    if (quotes) {
      let a1 = quotes.data.map(i => this.ticker(base_id, i));
      let s1 = await Promise.all(a1)
      await this.sortPair(s1)
      return s1
    }
    return null
  }
  async rte_ticker(base_id, quote_id, cb) {
    let base_name = (await this.queryAsset(base_id)).symbol
    let quote_name = (await this.queryAsset(quote_id)).symbol
    return rte.ticker(base_name, quote_name, cb)
  }
  async rome_depth(base_id, quote_id, cb) {
    let base_name = (await this.queryAsset(base_id)).symbol
    let quote_name = (await this.queryAsset(quote_id)).symbol
    return rte.depth(base_name, quote_name, cb)
  }
  async get_user_fixed(user) {
    let self = this
    async function s() {
      let [account] = await self.rawdb('get_full_accounts', [user], false);
      if (!account) {
        throw_err("UB.nouser.get_user_fixed")
      }
      return account
    }
    // console.log("get_user_fixed")
    const result = await cached('get_user_fixed' + user, s, false, 60 * 60)
    return result
  }
  async get_user(user) {
    let self = this
    async function s() {
      let [account] = await self.rawdb('get_full_accounts', [user], false);
      if (!account) {
        throw_err("UB.nouser.get_user")
      }
      return account[1]
    }
    const result = await cached('get_user' + user, s, false, 10)
    return result
  }
  async frozenBalances(user, coin_id) {
    let s = await this.get_user(user)
    let x = s.limit_orders.map(i => {
      return {
        id: i.id,
        owner: i.seller,
        asset_type: i.sell_price.base.asset_id,
        balance: parseInt(i.for_sale)
      }
    })
    let dic = _.groupBy(x, "asset_type")
    let arr = []
    for (let name in dic) {
      let v = _.sumBy(dic[name], "balance")
      let i = dic[name][0]
      arr.push({
        id: i.id,
        owner: i.owner,
        asset_type: i.asset_type,
        balance: v
      })
    }
    if (!coin_id) {
      return arr
    } else {
      return _.find(arr, {
        'asset_type': coin_id
      }) || null
    }
  }
  async get_acct_id(user) {
    let self = this
    async function s() {
      let x = await self.get_user(user);
      if (x) {
        return x.account.id
      } else {
        return x
      }
    }
    const result = await cached('get_acct_id' + user, s, false, 60 * 60)
    return result
  }
  async acct_balance(user) {
    let self = this
    async function s() {
      let user_id = await self.get_acct_id(user)
      let m = await self.rawdb("get_account_balances", user_id, [])
      return m
    }
    const result = await cached('acct_balance' + user, s, false, 3)
    return result
  }
  async key_accounts(pubs) {
    let s = await Promise.all(pubs.map(i => {
      return g.getUserIdByPub(i)
    }))
    let ids = _(s).flattenDeep().uniq().value()
    // 获取这些账户的activekey,owner.
    let accts = await g.rawdb("get_accounts", ids)
    // console.log(accts)
    // 判断是不是满足全部权限
    for (let a of accts) {
      let weight_threshold = a.active.weight_threshold
      for (let key of a.active.key_auths) {
        if (pubs.indexOf(key[0]) != -1) {
          if (key[1] >= weight_threshold) {
            a.full = true
          }
        }
      }
      weight_threshold = a.owner.weight_threshold
      for (let key of a.owner.key_auths) {
        if (pubs.indexOf(key[0]) != -1) {
          if (key[1] >= weight_threshold) {
            a.full = true
          }
        }
      }
    }
    accts = accts.map(a => {
      return {
        id: a.id,
        full: a.full || false,
        name: a.name
      }
    })
    return accts
  }
  async balances(user, coin_id) {
    let s = await this.acct_balance(user)
    s = await Promise.all(s.map(async i => {
      i.balance = i.amount
      i.asset_type = i.asset_id
      i.asset = await this.queryAsset(i.asset_id)
      return i
    }))
    s = s.filter(i => {
      if (i.asset.bitasset_data_id) {
        return false
      }
      return true
    }).map(i => {
      delete i.asset
      return i
    })
    if (!coin_id) {
      return s
    } else {
      return _.find(s, {
        'asset_type': coin_id
      }) || null
    }
  }
  async balances2(user, coin_id) {
    let s = await this.get_user(user)
    if (!s) {
      throw_err("S.nouser.balances")
    }
    if (!coin_id) {
      return s.balances
    } else {
      return _.find(s.balances, {
        'asset_type': coin_id
      }) || null
    }
  }
  async limit_orders(user) {
    let [account] = await this.rawdb('get_full_accounts', [user], false)
    let account_all_info = account[1]
    // log(JSON.stringify(account_all_info))
    return account_all_info.limit_orders
  }
  async limit_order_2(user) {
    let [account] = await this.rawdb('get_full_accounts', [user], false)
    let account_info = account[1].account
    log(account_info)
    let s = await this.raworder("get_opened_limit_order_status", account_info.id)
    return s
  }
  async getUserIdByPub(pubkey) {
    return await this.rawdb("get_key_references", [pubkey])
  }
  // bucket_seconds  [15,60,300,3600,86400]
  // 只保留几个维度各1000条数据
  // start,end utc 时间格式，'2018-05-01T00:00:00'
  async get_market_history(asset_a, asset_b, bucket_seconds, start, end) {
    let s = await this.get_market_history2(asset_a, asset_b, bucket_seconds, null, end)
    if (s.length > 0) {
      let s0Open = s[0].key.open
      log(s0Open, s[s.length - 1].key.open)
      if (s0Open > start && s0Open < end) {
        let u = await this.get_market_history(asset_a, asset_b, bucket_seconds, start, s0Open)
        if (u.length > 0) {
          // u.pop()
          if (u[u.length - 1].key.open === s0Open) {
            u.pop()
          }
          s = _.concat(u, s)
        }
      }
    }
    let out = []
    let now = null
    let last = null
    for (let b of s) {
      now = b
      if (!last) {
        last = b
      }
      let cha = moment(now.key.open).unix() - moment(last.key.open).unix()
      // console.log("cha",cha)
      let chaNum = parseInt(cha / bucket_seconds) - 1
      if (chaNum >= 1) {
        // console.log(last.key.open,now.key.open,chaNum)
        for (let i = 0; i < chaNum; i++) {
          let lastmoment = moment(last.key.open)
          let s1 = {
            close: last.close,
            high: last.close,
            key: {
              base: last.key.base,
              open: lastmoment.clone().add(last.key.seconds, "second").format("YYYY-MM-DDTHH:mm:ss"),
              quote: last.key.quote,
              seconds: last.key.seconds
            },
            low: last.close,
            open: last.close,
            volume: 0
          }
          out.push(s1)
          last = s1
        }
      }
      out.push(b)
      last = b
    }
    // console.log("out",out.map(i=>i.key.open))
    // console.log("s:",start,end,out.length,s.length,s[0],s[1])
    return out
  }
  async get_market_history2(asset_a, asset_b, bucket_seconds, start, end) {
    start = moment.utc(end).subtract(bucket_seconds * 199, "seconds").format("YYYY-MM-DDTHH:mm:ss")
    //  log("send",asset_a, asset_b, bucket_seconds, start, end)
    let s = await this.rawhistory('get_market_history', asset_a, asset_b, bucket_seconds, start, end)
    let x = await Promise.all(s.map(async (i) => {
      let base_id = await this.findBase(asset_a, asset_b)
      if (!base_id) {
        throw new Error(err_pre + `S.wrong_market.kline`)
      }
      let out = {
        key: i.key
      }
      let base_flag, quote_flag
      let quote_id
      if (base_id === i.key.base) {
        base_flag = "base"
        quote_flag = "quote"
        quote_id = i.key.quote
      } else {
        base_flag = "quote"
        quote_flag = "base"
        quote_id = i.key.base
      }
      for (let priceType of ["open", "close", "high", "low"]) {
        let base_amount = i[`${priceType}_${base_flag}`]
        let quote_amount = i[`${priceType}_${quote_flag}`]
        if (quote_amount > 0) {
          out[priceType] = (await this.assetAmount(base_id, base_amount)) / (await this.assetAmount(quote_id, quote_amount))
        } else {
          out[priceType] = 0
        }
      }
      if (out["high"] < out["low"]) {
        let h = out["high"]
        out["high"] = out["low"]
        out["low"] = h
      }
      out["volume"] = await this.assetAmount(quote_id, i[`${quote_flag}_volume`])
      return out
    }))
    return x
  }
  async lowhigh(asset_a, asset_b) {
    let end = moment.utc().format("YYYY-MM-DDTHH:mm:ss")
    let start = moment.utc().subtract(1, 'days').format("YYYY-MM-DDTHH:mm:ss")
    let s1 = await this.rawhistory('get_market_history', asset_a, asset_b, 60 * 60, start, end)
    let base_id = await this.findBase(asset_a, asset_b)
    let x = []
    for (let s of s1) {
      let base = {
        id: s.key.base,
        low: s.low_base,
        high: s.high_base
      }
      let quote = {
        id: s.key.quote,
        low: s.low_quote,
        high: s.high_quote
      }
      if (base_id !== s.key.base) {
        let tmep = base
        base = quote
        quote = tmep
      }
      let high = (await this.assetAmount(base.id, base.high)) / (await this.assetAmount(quote.id, quote.high))
      let low = (await this.assetAmount(base.id, base.low)) / (await this.assetAmount(quote.id, quote.low))
      x = x.concat([high, low])
    }
    return [_.max(x), _.min(x)]
  }
  async verify_code() {
    if (!navigator.onLine) {
      throw new Error(err_pre + `UN.network.verify_code`)
    }
    try {
      let hr = await axios.get(`${appconfig.faucet}/captcha`);
      if (hr.status == 200 && hr.data.id && hr.data.data) {
        return hr.data
      } else {
        console.error(hr.data)
        throw new Error(err_pre + `S.faucet.verify_code`)
      }
    } catch (e) {
      console.error(e)
      throw new Error(err_pre + `S.faucet.verify_code`)
    }
  }
  async register(user, password, code_id, code) {
    let res = this.generateKeys(user, password)
    let hr
    try {
      hr = await axios.post(`${appconfig.faucet}/register`, {
        "cap": {
          "id": code_id,
          "captcha": code
        },
        "account": {
          "name": user,
          "owner_key": res.pubKeys.active,
          "active_key": res.pubKeys.owner,
          "memo_key": res.pubKeys.owner,
          "refcode": null,
          "referrer": null
        }
      });
    } catch (e) {
      console.error(e)
      if (e.response.data) {
        switch (e.response.data.error) {
          case "Faucet is not availiable for temporary":
            let cUser = await this.get_user(user)
            if (cUser) {
              throw new Error(err_pre + "UB.user_exist.register")
            }
            throw new Error(err_pre + "UB.ip.register")
          case "Only one account could be registered from a single IP, within 5 mins":
            throw new Error(err_pre + "UB.ip.register")
          case "Incorrect verify code":
            throw new Error(err_pre + "UB.code.register")
          default:
            throw new Error(err_pre + "S.faucet.register")
        }
      }
    }
    if (hr.status == 200) {
      return hr.data
    } else {
      throw new Error(err_pre + "S.faucet.register")
    }
  }
  async op_send(type_name, obj, fee_asset_id = '1.3.0') {
    if (!this.userkeys) {
      throw new Error("locked")
    }
    let tr = new TransactionBuilder()
    tr.add_type_operation(type_name, obj)
    await tr.set_required_fees(fee_asset_id)
    await tr.update_head_block()
    tr.set_expire_seconds(30)

    const activeKey = this.findActivekey()
    if (!activeKey) {
      throw_err("UB.keys.ActiveKeyMiss")
    }
    // console.log(this.findActivekey())
    tr.add_signer(activeKey.privKey)
    // 递交上链
    let tr_obj = tr.toObject()
    console.log("to chain", JSON.stringify(tr_obj, null, 2))
    /** new way */
    // await tr.finalize()
    // tr.sign();
    // let txonline = ops.signed_transaction.toObject(tr)
    // console.log(txonline)
    // let txResult = await Apis.instance()
    // .network_api()
    // .exec("broadcast_transaction", [
    //   txonline
    // ])
    // console.log(txResult)
    let txResult = await tr.broadcast()
    return txResult[0].id
  }
  async claim_balance(balance_id, asset_id, amount) {
    try {
      let obj = {
        fee: {
          amount: "0",
          asset_id: "1.3.0"
        },
        "deposit_to_account": this.user.id,
        "balance_to_claim": balance_id,
        "balance_owner_key": this.findActivekey().pubKey,
        "total_claimed": {
          "amount": amount,
          "asset_id": asset_id
        }
      }
      let r = await this.op_send("balance_claim", obj)
      return r
    } catch (e) {
      if (e.message.includes("Unable to find Object")) {
        throw new Error(err_pre + "UB.noid.claim_balance")
      }
      if (e.message.includes("Insufficient Balance")) {
        throw new Error(err_pre + "UB.fee.claim_balance")
      }
      console.error(e)
      throw new Error(err_pre + "S.node.claim_balance")
    }
  }
  async cancel_order(order_id) {
    try {
      let obj = {
        "fee_paying_account": this.user.id,
        "order": order_id,
      }
      let r = await this.op_send("limit_order_cancel", obj)
      return r
    } catch (e) {
      if (e.message.includes("Unable to find Object")) {
        throw new Error(err_pre + "UB.noid.cancel_order")
      }
      if (e.message.includes("Insufficient Balance")) {
        throw new Error(err_pre + "UB.fee.cancel_order")
      }
      console.error(e)
      throw new Error(err_pre + "S.node.cancel_order")
    }
  }
  async returnerror() {
    return ["haha", new Error("ERR")]
  }
  async limit_order_create(base_id, quote_id, side, price, amount, fee_asset_id = "1.3.0", total = null) {
    if (!this.userkeys) {
      throw new Error("locked")
    }
    try {
      let sell, buy
      let quote_amount = await this.assetAmountRaw(quote_id, amount)
      if (!total) {
        total = amount * price
      }
      let base_amount = await this.assetAmountRaw(base_id, total)
      let base = {
        asset_id: base_id,
        amount: base_amount
      }
      let quote = {
        asset_id: quote_id,
        amount: quote_amount
      }
      if (side === "buy") {
        sell = base
        buy = quote
      } else {
        sell = quote
        buy = base
      }
      let obj = await this.create_limitorder_op(sell, buy)
      let r = await this.op_send("limit_order_create", obj, fee_asset_id)
      return r
    } catch (e) {
      if (e.message.includes("Cannot read property 'precision' of null")) {
        throw new Error(err_pre + "S.config.trade")
      }
      if (e.message.includes("insufficient balance")) {
        throw new Error(err_pre + "UB.balance.trade")
      }
      if (e.message.includes("Insufficient Balance")) {
        throw new Error(err_pre + "UB.fee.trade")
      }
      if (e.message.includes("authority")) {
        throw new Error(err_pre + "UB.authority.trade")
      }
      if (e.message.includes("ActiveKeyMiss")) {
        throw e
      }
      console.error(e)
      throw new Error(err_pre + "S.node.trade")
    }
  }
  async create_limitorder_op(sell, buy) {
    let t = moment.utc().add(5, 'years').format("YYYY-MM-DDTHH:mm:ss")
    return {
      "seller": this.user.id,
      "amount_to_sell": sell,
      "min_to_receive": buy,
      "expiration": t,
      "fill_or_kill": false
    }
  }
  async transfer({
    to,
    amount,
    memo,
    locktime, //seconds
    asset,
    fee_asset_id = '1.3.0'
    // is_send = true
  }) {

    if (!this.userkeys) {
      throw new Error("locked")
    }
    let u = await this.get_user(to)
    if (!u) {
      throw new Error(err_pre + "UB.nouser.transfer")
    }
    let obj
    try {
      obj = await this.send_obj({
        to,
        amount,
        memo,
        locktime, //seconds
        asset,
      })
      log(obj)
    } catch (e) {
      if (e.message === "no_memokey") {
        throw new Error(err_pre + "UB.memokey.transfer")
      }
    }
    try {
      let r = await this.op_send("transfer", obj, fee_asset_id)
      return r
    } catch (e) {
      if (e.message.includes("insufficient_balance")) {
        throw new Error(err_pre + "UB.balance.transfer")
      }
      if (e.message.includes("Insufficient Balance")) {
        throw new Error(err_pre + "UB.fee.transfer")
      }
      if (e.message.includes("authority")) {
        throw new Error(err_pre + "UB.authority.transfer")
      }
      if (e.message.includes("transfer_restricted")) {
        throw new Error(err_pre + "UB.transfer_restricted.transfer")
      }
      if (e.message.includes("ActiveKeyMiss")) {
        throw e
      }
      console.error(e)
      throw new Error(err_pre + "S.node.transfer")
      // return null
    }
  }
  async send_obj({
    to,
    amount,
    memo,
    locktime, //seconds
    asset
  }) {
    let from = this.user.name
    let userkeys = this.userkeys
    if (typeof asset === "string") {
      asset = await g.queryAsset(asset)
    }
    log('参数是:', from, to, amount, memo, [asset.id, asset.symbol, asset.precision], locktime)
    if (amount == 0 || amount == null) {
      log('ignore', to, amount)
      return null
    }
    let transferObj = await this.buildTransfer({
      from: from,
      to: to,
      memo: memo,
      amount: parseInt(amount * Math.pow(10, asset.precision)),
      locktime: locktime,
      asset: asset
    }, userkeys)
    return transferObj
  }
  async fake_tr_memo_fee(memo, fee_asset_id = "1.3.0") {
    let [fromAccount] = await this.get_acct([appconfig.gatewayUser.withdraw])
    let [toAccount] = await this.get_acct([appconfig.gatewayUser.withdraw])
    const res = this.generateKeys("yangyutest1", "yangyutest1dasdasdadsasd")
    let prikey = res.privKeys.memo
    let memoObject
    if (memo) {
      memoObject = await this.genMemo(fromAccount, toAccount, memo, prikey)
    }
    let reObject = {
      from: "1.2.13",
      to: "1.2.14",
      fee: {
        amount: 0,
        asset_id: '1.3.0'
      },
      amount: {
        amount: 100000,
        asset_id: "1.3.0"
      },
      memo: memoObject
    }
    let tr = new TransactionBuilder()
    tr.add_type_operation("transfer", reObject)
    await tr.set_required_fees(fee_asset_id)
    let s = tr.toObject()
    let fee = _.get(s, "operations[0][1].fee")
    if (fee) {
      let amount = await this.assetAmount(fee.asset_id, fee.amount)
      fee.amount = amount
      return fee
    } else {
      return {}
    }

  }
  async send({
    to,
    amount,
    memo,
    locktime, //seconds
    asset,
    is_send = true
  }) {
    try {
      let from = this.user.name
      let userkeys = this.userkeys
      log(1, asset)
      if (!asset.id) {
        asset = await g.queryAsset(asset)
      }
      log('参数是:', from, to, amount, memo, [asset.id, asset.symbol, asset.precision], locktime)
      if (!is_send) {
        log('fake send')
        return
      }
      if (amount == 0 || amount == null) {
        log('ignore', to, amount)
        return null
      }
      let tr = new TransactionBuilder()
      let transferObj = await this.buildTransfer({
        from: from,
        to: to,
        memo: memo,
        amount: parseInt(amount * Math.pow(10, asset.precision)),
        locktime: locktime,
        asset: asset
      }, userkeys)
      log('发送参数:', JSON.stringify(transferObj))
      if (transferObj) {
        tr.add_type_operation('transfer', transferObj)
        log(['trySendTranscation', 'AddToTransfer'])
      } else {
        console.warn(['trySendTranscation', 'Failed-to-add-transfer'])
      }
      if (tr.operations.length === 0) {
        console.warn(`from=${from} length 0`)
        return null
      }
      log(20, tr.toObject())
      await tr.set_required_fees()
      log(21, tr.toObject())
      await tr.update_head_block()
      // 设置expiration
      tr.set_expire_seconds(30)
      // 设置私钥
      const activeKey = userkeys[0].privKey
      tr.add_signer(activeKey)
      // 递交上链
      log(22, tr.toObject())
      let txResult = await tr.broadcast()
      return txResult[0].id
    } catch (e) {
      console.error(e)
      return null
    }
  }
  async get_acct(accts, all) {
    let s = await this.rawdb('get_full_accounts', accts, false)
    return s.map(i => {
      if (!i) {
        return i
      }
      if (all) {
        return i[1]
      } else {
        return i[1].account
      }
    })
  }
  async get_deposit_eos(username) {
    let EOSquery = "query GetAddress($accountName: String!, $asset: String!) {\n  getDepositAddress(accountName: $accountName, asset: $asset) {\n    address\n    accountName\n    asset\n    type\n    createAt\n    projectInfo {\n      projectName\n      logoUrl\n      contractAddress\n      contractExplorerUrl\n      __typename\n    }\n    __typename\n  }\n}\n"
    let hr = await axios.post(`${appconfig.gateway}/gateway`, {
      "operationName": "GetAddress",
      "variables": {
        "accountName": username,
        "asset": "EOS"
      },
      "query": EOSquery
    });
    if (hr.status == 200) {
      return hr.data
    }
  }

  // asset 目前是要去掉JADE.,测试环境去掉TEST.
  async get_deposit(asset, username) {
    // asset = await this.gateway_type(asset)
    if (asset.indexOf(appconfig.gatewayUser.asset_prefix) == 0) {
      asset = asset.slice(appconfig.gatewayUser.asset_prefix.length)
    }
    try {
      let hr = await axios.post(`${appconfig.gateway}/gateway`, {
        "operationName": "GetAddress",
        "variables": {
          "accountName": username,
          "asset": asset
        },
        "query": "query GetAddress($accountName: String!, $asset: String!) {\n  getDepositAddress(accountName: $accountName, asset: $asset) {\n    address\n    accountName\n    asset\n    type\n    createAt\n    __typename\n  }\n}\n"
      });
      if (hr.status == 200) {
        if (hr.data.errors) {
          let errors_string = JSON.stringify(hr.data.errors)
          if (errors_string.includes("No suitable asset")) {
            throw new Error(err_pre + "S.nocoin.get_deposit")
          }
          let u = await this.get_user(username)
          if (!u) {
            throw new Error(err_pre + "S.nouser.get_deposit")
          }
        }
        return hr.data
      } else {
        console.error(hr.data)
        throw new Error(err_pre + "S.gateway.get_deposit")
      }
    } catch (e) {
      throw (e)
    }
  }
  async new_deposit(asset, username) {

    let hr = await axios.post(`${appconfig.gateway}/gateway`, {
      "operationName": "GenNewAddress",
      "variables": {
        "accountName": username,
        "asset": asset
      },
      "query": "mutation GenNewAddress($accountName: String!, $asset: String!) {\n  newDepositAddress(accountName: $accountName, asset: $asset) {\n    address\n    accountName\n    asset\n    type\n    createAt\n    __typename\n  }\n}\n"
    });
    if (hr.status == 200) {
      return hr.data
    }
  }
  //返回提现手续费，最小提现额，gatewayAccount 等
  gateway_type(coin) {
    if (coin.indexOf(appconfig.gatewayUser.asset_prefix) == 0) {
      coin = coin.slice(appconfig.gatewayUser.asset_prefix.length)
    }
    return coin
  }
  async withdraw_info(coin) {
    if (coin.indexOf(appconfig.gatewayUser.asset_prefix) == 0) {
      coin = coin.slice(appconfig.gatewayUser.asset_prefix.length)
    }
    async function s() {
      let hr = await axios.post(`${appconfig.gateway}/gateway`, {
        "operationName": "WithdrawInfo",
        "variables": {
          "type": coin
        },
        "query": "query WithdrawInfo($type: String!) {\n  withdrawInfo(type: $type) {\n    fee\n    minValue\n    precision\n    asset\n    type\n    gatewayAccount\n    __typename\n  }\n}\n"
      });
      if (hr.status == 200) {
        if (!hr.data.data) {
          let error_string = JSON.stringify(hr.data.errors)
          log("error_string", error_string)
          if (error_string.includes("No availiable fee")) {
            throw new Error(err_pre + "S.config.withdraw_info")
          }
        }
        if (hr.data.data && hr.data.data.withdrawInfo) {
          return hr.data
        }
        throw new Error(err_pre + "S.gateway.withdraw_info")
      }
      throw new Error(err_pre + "S.gateway.withdraw_info")
    }
    const result = await cached('withdraw_info' + coin, s, false, 600)
    return result
  }
  async withdraw(coin, coin_symbol, amount, addr, fee_asset_id = '1.3.0') {
    coin = this.gateway_type(coin)
    console.log("withraw", coin, coin_symbol, amount, addr, fee_asset_id)
    let memo = `${appconfig.memos.withdraw}:${coin}:${addr}`
    try {
      let s = await this.transfer({
        to: appconfig.gatewayUser.withdraw,
        amount: amount,
        asset: coin_symbol,
        memo: memo,
        fee_asset_id: fee_asset_id
      })
      return s
    } catch (e) {
      if (e.message.includes("transfer")) {
        e.message = e.message.replace("transfer", "withdraw")
      }
      throw (e)
    }
  }
  async findBase(id1, id2) {
    if (this.bases[id1]) {
      let x = this.bases[id1].data
      if (x.indexOf(id2) !== -1) {
        return id1
      }
    }
    if (this.bases[id2]) {
      let x = this.bases[id2].data
      if (x.indexOf(id1) !== -1) {
        return id2
      }
    }
    if (config.gamePairsBase) {
      if (config.gamePairsBase[id1] && config.gamePairsBase[id1][id2]) {
        return id1
      }
      if (config.gamePairsBase[id2] && config.gamePairsBase[id2][id1]) {
        return id2
      }
    }
    try {
      let id13 = id1.split(".")[2]
      let id23 = id2.split(".")[2]
      if (parseInt(id13) > parseInt(id23)) {
        return id2
      } else {
        return id1
      }
    } catch (e) {
      console.error(e)
      return id1
    }
  }
  all_status() {
    // let history = status.status("trade") && status.status("order")
    let market = status.status("node") && status.status("mdp")
    return {
      market: market,
      order: status.status("order"),
      trade: status.status("trade")
    }
  }
  // start,end  UTC时间 2017-07-08 ,精确到天,或者都传null是所有时间
  async top_asset() {
    if (config.top_asset) {
      let s = await Promise.all(config.top_asset.map(async (i) => {
        let c = await this.queryAsset(i)
        return c.id
      }))
      return s
    }
    return []
  }
  async transfer_history(user, asset_id, send_receive, page, limit) {
    let re
    let account = await this.get_user_fixed(user)
    let account_info = account[1].account
    let is_send = false
    if (send_receive) {
      is_send = false
      if (send_receive === 'send') {
        is_send = true
      }
      re = await this.transfer_history_sender(user, asset_id, is_send, page, limit)
    } else {
      re = await this.transfer_history_sender(user, asset_id, is_send, page, limit, "all")
      // re = await this.transfer_history_all(user,asset_id,page,limit)
    }
    let s = re[0].map(i => {
      let op = i.op[1]
      let send_type
      if (op.from === account_info.id) {
        send_type = "send"
      } else {
        send_type = "receive"
      }
      let vesting_period
      if (op.extensions && op.extensions.length > 0) {
        vesting_period = op.extensions[0][1]
      }
      return {
        type: send_type,
        time: i.timestamp,
        amount: op.amount.amount,
        asset: op.amount.asset_id,
        from: op.from,
        to: op.to,
        memo: op.memo,
        vesting_period: vesting_period
      }
    })
    return [s, re[1]]
  }
  async transfer_history_all(user, asset_id, page, limit) {
    let account = await this.get_user_fixed(user)
    let account_info = account[1].account
    let hr = await axios.get(`${appconfig.server}/get_ops_conds_mongo`, {
      params: {
        asset: asset_id || "null",
        page: page || 0,
        limit: limit || 20,
        account: account_info.id,
        op_type_id: 0,
        start: "null",
        end: "null"
      }
    });
    if (hr.status == 200) {
      return hr.data
    } else {
      return null
    }
  }
  async transfer_history_sender(user, asset_id, is_send, page, limit, flag) {
    let account = await this.get_user_fixed(user)
    let account_info = account[1].account
    let params = {
      asset: asset_id || "null",
      page: page || 0,
      limit: limit || 20,
      acct_from: is_send ? account_info.id : 'null',
      acct_to: !is_send ? account_info.id : 'null',
    }
    if (flag == "all") {
      params.acct_from = "or"
      params.acct_to = account_info.id
    }
    let hr = await axios.get(`${appconfig.server}/get_ops_by_transfer_accountspair_mongo2`, {
      params: params
    });
    if (hr.status == 200) {
      return hr.data
    } else {
      return null
    }
  }
  async fillorder_history_flag(user, start, end, page, limit, white_flag) {
    let account = await this.get_user_fixed(user)
    let account_info = account[1].account
    let filterIn = 'null'
    let filterOut = 'null'
    if (white_flag == "white") {
      filterIn = config.whitePairs.map(i => {
        return `${i[0]}_${i[1]},${i[1]}_${i[0]}`
      }).join(",")
    }
    if (white_flag == "custom") {
      let arr = config.whitePairs.concat(config.gamePairs)
      filterOut = arr.map(i => {
        return `${i[0]}_${i[1]},${i[1]}_${i[0]}`
      }).join(",")
    }
    if (white_flag == "game") {
      filterIn = config.gamePairs.map(i => {
        return `${i[0]}_${i[1]},${i[1]}_${i[0]}`
      }).join(",")
    }
    let hr = await axios.get(`${appconfig.server}/get_fill_bypair`, {
      params: {
        account: account_info.id,
        page: page || 0,
        limit: limit || 20,
        start: start || 'null',
        end: end || 'null',
        filter_in: filterIn,
        filter_out: filterOut
      }
    });
    if (hr.status == 200) {
      let r = Promise.all(hr.data[0].map(async (i) => {
        let op = i["op"][1]
        let base, quote
        let base_id_find = await this.findBase(op.pays.asset_id, op.receives.asset_id)
        let fee = op.fee
        fee.amount = await this.assetAmount(fee.asset_id, fee.amount)
        if (op.pays.asset_id === base_id_find) {
          base = op.pays
          quote = op.receives
        } else {
          base = op.receives
          quote = op.pays
        }
        let market = {
          base: base.asset_id,
          quote: quote.asset_id
        }
        let tradetype = "sell"
        if (op["pays"]["asset_id"] === base_id_find) {
          tradetype = "buy"
        }
        let base_amount = await this.assetAmount(market.base, base.amount)
        let quote_amount = await this.assetAmount(market.quote, quote.amount)
        // let price = base_amount / quote_amount
        let b_o, q_o
        if (op.fill_price.base.asset_id === base_id_find) {
          b_o = op.fill_price.base.amount
          q_o = op.fill_price.quote.amount
        } else {
          b_o = op.fill_price.quote.amount
          q_o = op.fill_price.base.amount
        }
        let c = await this.assetAmount(market.quote, q_o)
        let d = await this.assetAmount(market.base, b_o)
        let price = d / c
        return {
          time: i.timestamp,
          market: market,
          tradetype: tradetype,
          price: price,
          base_amount: base_amount,
          quote_amount: quote_amount,
          fee: fee
        }
      }))
      status.back_service("trade", 5)
      return r
    } else {
      return null;
    }
  }
  async fillorder_history(user, start, end, page, limit, base_id, quote_id, white_flag) {
    status.call_service("trade", 10)
    if (!base_id && !quote_id && white_flag) {
      return await this.fillorder_history_flag(user, start, end, page, limit, white_flag)
    }
    let account = await this.get_user_fixed(user)
    let account_info = account[1].account
    let hr = await axios.get(`${appconfig.server}/get_ops_fill_pair`, {
      params: {
        account: account_info.id,
        page: page || 0,
        limit: limit || 20,
        base: base_id || 'null',
        quote: quote_id || 'null',
        start: start || 'null',
        end: end || 'null'
      }
    });
    if (hr.status == 200) {
      let r = Promise.all(hr.data.map(async (i) => {
        let op = i["op"][1]
        let base, quote
        let base_id_find = await this.findBase(op.pays.asset_id, op.receives.asset_id)
        let fee = op.fee
        fee.amount = await this.assetAmount(fee.asset_id, fee.amount)
        if (op.pays.asset_id === base_id_find) {
          base = op.pays
          quote = op.receives
        } else {
          base = op.receives
          quote = op.pays
        }
        let market = {
          base: base.asset_id,
          quote: quote.asset_id
        }
        let tradetype = "sell"
        if (op["pays"]["asset_id"] === base_id_find) {
          tradetype = "buy"
        }
        let base_amount = await this.assetAmount(market.base, base.amount)
        let quote_amount = await this.assetAmount(market.quote, quote.amount)
        // let price = base_amount / quote_amount
        let b_o, q_o
        if (op.fill_price.base.asset_id === base_id_find) {
          b_o = op.fill_price.base.amount
          q_o = op.fill_price.quote.amount
        } else {
          b_o = op.fill_price.quote.amount
          q_o = op.fill_price.base.amount
        }
        let c = await this.assetAmount(market.quote, q_o)
        let d = await this.assetAmount(market.base, b_o)
        let price = d / c
        return {
          time: i.timestamp,
          market: market,
          tradetype: tradetype,
          price: price,
          base_amount: base_amount,
          quote_amount: quote_amount,
          fee: fee
        }
      }))
      status.back_service("trade", 5)
      return r
    } else {
      return null;
    }
  }
  async genPassword() {
    let keypass = (key.get_random_key().toWif()).substr(0, 44)
    let adds = "_"
    return "P" + _.shuffle(keypass + adds).join("")
  }
  async deposit_infos(coin) {
    let c = await this.queryAsset(coin)
    let s
    try {
      s = await this.appserver_json(`deposit/${c.id}.json`)
      if (!s) {
        throw new Error(`S.config_${c.symbol}.deposit_infos`)
      }
      return s
    } catch (e) {
      throw (e)
    }
  }
  async withdraw_infos(coin) {
    let c = await this.queryAsset(coin)
    let s
    try {
      s = await this.appserver_json(`withdraw/${c.id}.json`)
      if (!s) {
        throw new Error(`S.config_${c.symbol}.withdraw_infos`)
      }
      return s
    } catch (e) {
      throw (e)
    }
  }
  async appconfig_settings() {
    let s
    try {
      s = await this.appserver_json(`settings.json`)
      if (!s) {
        throw new Error(`S.config_${c.symbol}.appconfig_settings`)
      }
      return s
    } catch (e) {
      throw (e)
    }
  }
  async deposit_list() {
    let s = await this.appserver_json("deposit.json")
    this.store.commit('user/SET_DEPOSIT', s)
    return s
  }
  async withdraw_list() {
    let s = await this.appserver_json("withdraw.json")
    log('withdraw_list', s)
    this.store.commit('user/SET_WITHDRAW', s)
    return s
  }
  async fees() {
    let self = this
    async function s() {
      let x = await self.rawdb("get_objects", ["2.0.0"]);
      return x[0].parameters.current_fees.parameters
    }
    const result = await cached('fees', s, false, 60 * 60)
    return result
  }
  async coin_fee(coin_id, cyb_fee) {
    let sell = await this.queryAsset(coin_id)
    log(sell)
    let x = sell.options.core_exchange_rate
    let CYB, other
    if (x.base.asset_id === '1.3.0') {
      CYB = x.base
      other = x.quote
    } else {
      CYB = x.quote
      other = x.base
    }
    let otherfee = cyb_fee * other.amount / CYB.amount
    return otherfee
  }
  // 换算法币价格
  // 必须先loadBases() , 美元的话settle_id 传USDT
  async assetValue(coin_id, amount, settle_id_or_symbol) {
    try {
      let x = await this.assetValue2(coin_id, amount)
      if (x === -1) {
        return x
      }
      if (settle_id_or_symbol) {
        let c = await this.queryAsset(settle_id_or_symbol)
        // log(c)
        let settle_value = await this.assetValue2(c.id, 1)
        if (settle_value === 0) {
          return -1
        }
        x = x / settle_value
      }
      return x
    } catch (e) {
      // console.error(e)
      return 0
    }
    // if (x === 0) {
    //   x = -1
    // }
  }
  async assetValue2(coin_id, amount) {
    let x = await this.legal_currency()
    if (x.code !== 0) {
      throw new Error("can not get legal_currency")
    }
    let bases_price = _.keyBy(x.prices, "name")
    // log(this.bases, bases_price)
    // 检查是否base
    let asset = await this.queryAsset(coin_id)
    if (this.bases[asset.id]) {
      let p = bases_price[asset.gatewayname].value
      return p * amount
    }
    for (let c of appconfig.bases) {
      let base_coin = await this.queryAsset(c)
      if (this.bases[base_coin.id].data.indexOf(asset.id) !== -1) {
        let base_m = await this.base_market(base_coin.id)
        let base_d = _.keyBy(base_m, "quote")
        let p1 = base_d[asset.id].latest
        let c = await this.queryAsset(base_coin.id)
        let p = bases_price[c.gatewayname].value
        return p * amount * p1
      }
    }
    return -1
  }
  // 计算提现手续费
  // return gatewayfee,cybexfee,withdraw_amount,real_amount
  async calAmountAndFee(uname, amount, coin_id, addr) {
    // 网关手续费
    let coin = await this.queryAsset(coin_id)
    let gatewayname = coin.gatewayname
    let g = await this.withdraw_info(gatewayname)
    // log(g)
    let gatewayfee = _.get(g, "data.withdrawInfo")
    let dic = {}
    if (!gatewayfee) {
      throw new Error("can get gateway fee")
    }
    dic["gatewayfee"] = {
      asset_id: gatewayfee.asset,
      amount: gatewayfee.fee
    }
    // 上链手续费
    let memo
    if (addr) {
      memo = `${appconfig.memos.withdraw}:${gatewayname}:${addr}`
    }
    log(memo)
    let cybfee = await this.fake_tr_memo_fee(memo, "1.3.0")
    let coinfee = await this.fake_tr_memo_fee(memo, coin.id)
    let CYB_amount = await this.balances(uname, "1.3.0")
    let cyb_fee = await this.assetAmountRaw("1.3.0", cybfee.amount)
    if (CYB_amount && CYB_amount.balance > cyb_fee) {
      dic["cybexfee"] = cybfee
    } else {
      dic["cybexfee"] = coinfee
    }
    //
    let withdraw_amount, real_amount
    if (dic["cybexfee"].asset_id == "1.3.0") {
      withdraw_amount = amount
      real_amount = amount - gatewayfee.fee
    } else {
      let sell_amount = await this.balances(uname, coin.id)
      if (!sell_amount) {
        // throw new Error("no money to withraw")
        sell_amount = 0
      }
      let b = await this.assetAmount(coin.id, sell_amount.balance)
      if (b - amount > dic["cybexfee"].amount) {
        // 使用余额
        withdraw_amount = amount
        real_amount = amount - gatewayfee.fee
      } else {
        withdraw_amount = amount - dic["cybexfee"].amount
        real_amount = withdraw_amount - gatewayfee.fee
      }
    }
    dic["withdraw_amount"] = withdraw_amount
    dic["real_amount"] = real_amount
    return dic
  }
  async tradefee(user_id, sell_coin_id, tradetype = 1) {
    let CYB_id = "1.3.0"
    let CYB_amount = await this.balances(user_id, CYB_id)
    // let sell_amount = await this.balances(user_id,sell_coin_id)
    let fee = await this.fees()
    let cybfee = fee[tradetype][1].fee
    log("fee", cybfee)
    // let cyb = await this.queryAsset(CYB_id)
    let arr = []
    let cybv = await this.assetAmount(CYB_id, cybfee)
    let s = {
      "asset_id": CYB_id,
      "amount": cybv
    }
    if (CYB_amount && CYB_amount.balance > cybfee) {
      s.use = true
    }
    arr.push(s)
    // }
    let sellfee = await this.coin_fee(sell_coin_id, cybfee)
    log("sellfee", sellfee)
    let sellfeeV = await this.assetAmount(sell_coin_id, sellfee)
    let s2 = {
      "asset_id": sell_coin_id,
      "amount": sellfeeV
    }
    arr.push(s2)
    return arr
  }
  async allMarket(coin = "ETH") {
    async function s() {
      let s = await this.base_market("")
      s = s.map(i => {
        let x = i.map(t => {
          t.base_volume = parseFloat(t.base_volume)
          return t
        })
        return {
          asset_id: x[0].base,
          amount: _.sumBy(x, "base_volume")
        }
      })
      let amount = 0
      for (let c of s) {
        let a = await this.assetValue(c.asset_id, c.amount, coin)
        amount = amount + _.max([0, a])
      }
      return amount * 2
    }
    const result = await cached('allMarket' + coin, s.bind(this), false, 3)
    return result
  }
  async queryAssets(user) {
    const [account] = await this.rawdb('get_full_accounts', [user], false)
    const fullaccount = account[1]
    this.accountInfo = fullaccount.account
    const balances = fullaccount.balances
    this.balances = balances
    return balances
  }
}

export let g = new Cybex(NODE_LIST)
if (config.extra_log) {
  for (let name of ["get_market_history", "balances", "assetValue", "chainDepth"]) {
    let old = g[name]
    g[name] = async function () {
      let date1 = new Date(); //开始时间
      //结束时间
      let s = await old.apply(g, arguments);
      let date2 = new Date();
      let seconds = date2.getTime() - date1.getTime()
      console.log(name, seconds, arguments)
      return s
    }
  }
}
// let g2 = new Cybex(NODE_LIST2)
export function setStore(store) {
  g.store = store
}
