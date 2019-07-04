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
  newgateway: 'http://35.220.160.53:8182',
  appconfig: {
    server: "http://47.107.136.146:8081", //"http://39.105.55.115:8081", //'https://api.cybex.live',//
    appserver: 'http://47.91.242.71:3039',
    faucet: 'https://faucet.51nebula.com', //'https://faucet.cybex.io'
    gateway: 'https://gatewaytest.cybex.io',
    dataserver: 'http://47.101.143.103:8083',
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
  }
}