let env_config
let env = ""
try {
  env = require('./env').default.env
	console.log(env)
  env_config = require( /* webpackMode: "eager" */ `./config.${env}`).default
} catch (e) {
  console.log(e)
  env_config = {}
}
let config = {
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
  rebate_url :"https://refer.cybex.io/rebate/",
  appconfig: {
    server: "http://120.79.34.14:8081", //"http://39.105.55.115:8081", //'https://api.cybex.live',//
    appserver: 'http://47.91.242.71:3039',
    faucet: 'https://faucet.51nebula.com', //'https://faucet.cybex.io'
    gateway: 'https://gatewaytest.cybex.io',
    gatewayQuery: 'https://gatewaytest.cybex.io/query',
    dataserver: 'http://47.101.143.103:8083',
    dataserver_disable: true,
    // bases: ['1.3.0', '1.3.53', '1.3.56', '1.3.58'],
    bases: ['CYB', 'ETH', 'BTC', 'USDT'],
    memos: {
      withdraw: "withdraw:CybexGatewayDev"
    },
    gatewayUser: {
      withdraw: "jade-gateway",
      asset_prefix: "TEST.",
      asset_default_no_prefix: ["CYB", "CYBG"]
    },
  },
  error: {
    pre: "ex2" + env
  },
  sentry: {
    enable: false,
    dns: "http://03ac1ee53ec64fb09857b763ac3fd38f@120.27.16.142:9000/3"
  },
  RTE_server: 'ws://47.244.40.252:18888/',
  Use_RTE: true,
  Order_server: ["wss://shenzhen.51nebula.com","wss://hangzhou.51nebula.com"],
  top_asset: ["CYB", "BTC", "ETH", "USDT"],
  log_ignore: false,
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
  unlockPeriod: 5 * 60,
  captchInterval: 5 * 1000,
  smallCYBAmount: 100,
  extra_log: false,
  status_cache: {
    node: "status_cache_node",
    order: "status_cache_order",
    mdp: "status_cache_mdp",
    trade: "status_cache_trade"
  },
  game_prefix: "ARENA."
}
if (env_config) {
  Object.assign(config, env_config)
  // console.log("config", config)
}
if (config.appconfig && config.appconfig.gatewayUser &&config.appconfig.gatewayUser.asset_prefix){
  let prefix = config.appconfig.gatewayUser.asset_prefix
  config.top_asset = config.top_asset.map(i=>{
    if (i!=="CYB" && i.indexOf(prefix)!==0){
      return prefix+i
    }
    return i
  })
  config.appconfig.bases = config.appconfig.bases.map(i=>{
    if (i!=="CYB" && i.indexOf(prefix)!==0 && i.indexOf("1.3.")!==0){
      return prefix+i
    }
    return i
  })
  // console.log(111,config)
}
try {
  if (config.gamePairs && config.gamePairs.length > 0){
    let gameBase = {}
    for (let pair of config.gamePairs){
      let quota = pair[0]
      let base = pair[1]
      if (!gameBase[base]){
        gameBase[base] = {}
      }
      gameBase[base][quota] = 1
    }
    config.gamePairsBase = gameBase
  }
}catch(e){
  console.error(e)
}
export default config
