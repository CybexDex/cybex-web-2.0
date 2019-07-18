export default {
  NODE_LIST: [
    // 'wss://shenzhen.51nebula.com',
    // 'wss://hangzhou.51nebula.com/', // 这是测试链
    'wss://shanghai.51nebula.com/',
    'wss://beijing.51nebula.com/',
    "wss://hkbak.cybex.io/",
    'wss://hongkong.cybex.io/',
    'wss://tokyo-01.cybex.io/',
    'wss://korea-01.cybex.io/',
    'wss://singapore-01.cybex.io/',
    'wss://europe01.cybex.io/',
    'wss://usa-01.cybex.io/'
  ],
  gaID:'UA-129900093-1',
  umengID: "1277677507",
  newgateway: 'https://gateway.cybex.io',
  appconfig: {
    server: 'https://api.cybex.live',// 'https://live.cybex.io', // "https://cybtestbrowser.nbltrust.com", //"http://39.105.55.115:8081", //'https://api.cybex.live',//
    appserver: 'https://app.cybex.io',
    faucet: 'https://faucet.cybex.io', //'https://faucet.cybex.io'
    gateway: 'https://gateway.cybex.io',
    gatewayQuery: 'https://gateway-query.cybex.io',
    dataserver: 'http://47.101.143.103:8083',
    dataserver_disable: true,
    // bases: ['1.3.0', '1.3.53', '1.3.56', '1.3.58'],
    bases: ['CYB', 'USDT', 'ETH', 'BTC'],
    memos: {
      withdraw: "withdraw:CybexGateway"
    },
    gatewayUser: {
      withdraw: "cybex-jadegateway",
      asset_prefix: "JADE.",
      asset_default_no_prefix: ["CYB", "CYBG"]
    }
  },
  RTE_server: 'wss://mdp.cybex.io/',
  Use_RTE: process.env.USE_MDP === "1" ? true : false,
  Order_server: 'wss://apihk.cybex.io/',//  'wss://shanghai.51nebula.com/',//'wss://apihk.cybex.io/',
  sentry: {
    enable: true,
    dns: "https://5c8d458e27214a1ebb01faf6e9b2d567@sentry.nbltrust.com/10"
  },
  top_asset: ["CYB", "BTC", "ETH", "USDT"],
  log_ignore: true,
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
    "oldSiteFee": {
      "en": "https://cybex.io/en/rates.html",
      "cn": "https://cybex.io/zh-cn/rates.html"
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
  gamePairs:[["1.3.1149","1.3.1148"],["1.3.1150","1.3.1148"],["1.3.1151","1.3.1148"]] ,
  unlockPeriod: 5 * 60,
  captchInterval: 5 * 1000,
  smallCYBAmount: 100
}
