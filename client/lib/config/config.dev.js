export default {
  NODE_LIST: [
    'wss://shenzhen.51nebula.com',
    // 'wss://hangzhou.51nebula.com/', // 这是测试链
    // 'wss://shanghai.51nebula.com/',
    // 'wss://beijing.51nebula.com/',
    // 'wss://hongkong.cybex.io/',
    // 'wss://tokyo-01.cybex.io/',
    // 'wss://korea-01.cybex.io/',
    // 'wss://singapore-01.cybex.io/'
  ],
  gaID:"UA-129900093-2",
  umengID: "1277677507",
  newgateway: 'http://35.220.160.53:8182',
  appconfig: {
    server: "http://120.79.34.14:8081", //"http://39.105.55.115:8081", //'https://api.cybex.live',//
    appserver: 'http://47.91.242.71:3039',
    faucet: 'https://faucet.51nebula.com', //'https://faucet.cybex.io'
    gateway: 'https://gatewaytest.cybex.io',
    gatewayQuery: 'https://gatewaytest.cybex.io/query',
    dataserver: 'http://47.101.143.103:8083',
    dataserver_disable: true,
    // bases: ['1.3.0', '1.3.53', '1.3.56', '1.3.58'],
    bases: ['1.3.0', '1.3.23', '1.3.2', '1.3.3'],
    memos: {
      withdraw: "withdraw:CybexGatewayDev"
    },
    gatewayUser: {
      withdraw: "jade-gateway",
      asset_prefix: "TEST.",
      asset_default_no_prefix: ["CYB", "CYBG"]
    }
  },
  sentry: {
    enable: true,
    dns: "http://03ac1ee53ec64fb09857b763ac3fd38f@120.27.16.142:9000/3"
  },
  top_asset: ["CYB", "BTC", "ETH", "USDT"],
  Order_server: ['wss://shenzhen.51nebula.com'],
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
  gamePairs:[["1.3.241","1.3.243"],["1.3.242","1.3.243"],["1.3.244","1.3.243"]] ,// [["1.3.0","1.3.237"]],
  unlockPeriod: 5 * 60,
  captchInterval: 5 * 1000,
  smallCYBAmount: 100
}
