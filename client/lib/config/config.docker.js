export default {
  NODE_LIST: [
    "ws://uatfn.51nebula.com"
  ],
  gaID:'UA-129900093-3',
  umengID: "1277677507",
  newgateway: 'http://127.0.0.1:8182',
  appconfig: {
    server: 'http://uatliveapi.51nebula.com',// 'https://live.cybex.io', // "https://cybtestbrowser.nbltrust.com", //"http://39.105.55.115:8081", //'https://api.cybex.live',//
    appserver: 'http://127.0.0.1:3039',
    faucet: 'http://uatfaucet.51nebula.com', //'https://faucet.cybex.io'
    dataserver_disable: true,
    // bases: ['1.3.0', '1.3.53', '1.3.56', '1.3.58'],
    bases: ['CYB', 'USDT', 'ETH', 'BTC'],
    memos: {
      withdraw: "withdraw:CybexGateway"
    },
    gatewayUser: {
      withdraw: "xiao01",
      asset_prefix: "JADE.",
      asset_default_no_prefix: ["CYB", "CYBG"]
    }
  },
  RTE_server: 'wss://rteuat.cybex.io',
  Use_RTE: process.env.USE_MDP === "1" ? true : false,
  Order_server: "ws://uatfn.51nebula.com",//  'wss://shanghai.51nebula.com/',//'wss://apihk.cybex.io/',
  sentry: {
    enable: false,
    dns: "https://sentry.nbltrust.com"
  },
  top_asset: ["CYB", "BTC", "ETH", "USDT"],
  log_ignore: false,
  extra_log: false,
  links: {
    "about": {
      "en": "https://intro.cybex.io/index_en.html",
      "cn": "https://intro.cybex.io/#what-section"
    },
    "feedback": {
      "en": "https://cybex.zendesk.com/hc/en-us",
      "cn": "https://cybex.zendesk.com/hc/zh-cn"
    },
    "assetIntro": {
      "en": "https://cybex.io/en/assets.html",
      "cn": "https://cybex.io/zh-cn/assets.html"
    },
    "oldSite": "https://olddex.cybex.io",
    "cybexlive": "https://cybex.live",
    "telegram": "https://t.me/CYBEXChinese",
    "medium": "https://medium.com/@CYBEXexchange",
    "twitter": "https://twitter.com/CYBEXExchange",
    "instagram": {
      "en": "https://www.instagram.com/cybexexchange/?hl=en",
      "cn": "https://www.instagram.com/cybexexchange/?hl=zh-cn"
    },
    "facebook": "https://www.facebook.com/Cybex.exchange.center"
  },
  // gamePairs:[["1.3.1149","1.3.1148"],["1.3.1150","1.3.1148"],["1.3.1151","1.3.1148"]] ,
  unlockPeriod: 5 * 60,
  captchInterval: 5 * 1000,
  smallCYBAmount: 100
}
