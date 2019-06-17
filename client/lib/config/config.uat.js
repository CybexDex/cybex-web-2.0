export default {
  NODE_LIST: [
    "ws://47.100.98.113:38090"
  ],
  gaID:'UA-129900093-3',
  umengID: "1277677507",
  appconfig: {
    server: 'http://47.100.98.113:8081',// 'https://live.cybex.io', // "https://cybtestbrowser.nbltrust.com", //"http://39.105.55.115:8081", //'https://api.cybex.live',//
    appserver: 'http://47.100.98.113:3039',
    faucet: 'http://47.100.98.113:3050', //'https://faucet.cybex.io'
    gateway: 'http://47.100.98.113:5681',
    gatewayQuery: 'http://47.100.98.113:5681/query',
    dataserver: 'http://47.101.143.103:8083',
    dataserver_disable: true,
    // bases: ['1.3.0', '1.3.53', '1.3.56', '1.3.58'],
    bases: ['CYB', 'USDT', 'ETH', 'BTC'],
    memos: {
      withdraw: "withdraw:CybexGateway"
    },
    gatewayUser: {
      withdraw: "uat-gateway",
      asset_prefix: "JADE.",
      asset_default_no_prefix: ["CYB", "CYBG"]
    }
  },
  RTE_server: 'wss://rteuat.cybex.io',
  Use_RTE: process.env.USE_MDP === "1" ? true : false,
  Order_server: "ws://47.100.98.113:38090",//  'wss://shanghai.51nebula.com/',//'wss://apihk.cybex.io/',
  sentry: {
    enable: true,
    dns: "https://5c8d458e27214a1ebb01faf6e9b2d567@sentry.nbltrust.com/10"
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
