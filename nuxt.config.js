let pack = require('./package.json')
export default {
  mode: 'spa',
  /**
   * 环境变量
   */
  env: {
    USE_TESTNET: process.env.USE_TESTNET || '1',
    USE_MDP: process.env.USE_MDP || '1',
    USE_ENV: process.env.USE_ENV || null,
    VERSION: pack.version
  },
  server: {
    host: '0.0.0.0',
    port: '8000'
  },
  /**
   * 工程目录
   */
  srcDir: 'client/',
  /**
   * SPA时的Loading
   */
  loadingIndicator: {
    name: 'three-bounce',
    color: '#FF9143',
    background: '#171D2A'
  },
  /*
   ** Headers of the page
   */
  head: {
    title: 'Index',
    titleTemplate: '%s - Cybex',
    meta: [{
        charset: 'utf-8'
      },
      {
        name: 'format-detection',
        content: 'telephone=no'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: 'Cybex Ex Frontend'
      }
    ],
    link: [{
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    }]
  },
  /*
   ** Customize the progress bar color
   */
  loading: {
    color: '#3B8070'
  },
  /**
   * Router configuration
   */
  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'test',
        path: '/:lang/test',
        component: resolve(__dirname, 'client/lib/test.vue')
      })
      if (process.env.NODE_ENV !== 'production') {
        routes.push({
          name: 'qa-test',
          path: '/:lang/qa-test',
          component: resolve(__dirname, 'client/lib/qa-test.vue')
        })
        routes.push({
          name: 'wallet-test',
          path: '/:lang/wallet-test',
          component: resolve(__dirname, 'client/lib/wallet-test.vue')
        })
      }
    },
    middleware: ['i18n', 'nouser', 'init-store'],
    scrollBehavior: function (to, from, savedPosition) {
      return { x: 0, y: 0 }
    }
    // mode: 'hash' IE EDGE 42.17134.1.0白屏问题
  },
  /**
   * Plugin configuration
   */
  plugins: [
    '~plugins/i18n',
    '~plugins/vuetify',
    '~plugins/filter',
    { 
      src: '~plugins/detect',  
      ssr: false
    },
    {
      src: '~plugins/ga.js',
      ssr: false
    },
    {
      src: '~plugins/umeng.js',
      ssr: false
    },
    {
      src: '~plugins/cybex',
      ssr: false
    },
    {
      src: '~plugins/log',
      ssr: false
    },
    {
      src: '~plugins/tradingview',
      ssr: false
    },
    {
      src: '~plugins/perfect-scroll',
      ssr: false
    },
    // { src: '~plugins/vuex-persist', ssr: false }
  ],
  /**
   * static css load
   */
  css: [
    {
      src: '~/assets/style/app.styl'
    }
  ],
  /*
   ** Build configuration
   */
  build: {
    // analyze: true,
    // filenames: {
    //   app: '[name].[chunkhash].js'
    // },
    transpile: [/^vuetify/],
    // optimization:{
    //   minimize: true,
    //   splitChunks:{
    //     chunks: "all"
    //   }
    // },
    babel: {
      plugins: [
        ['transform-imports', {
          'vuetify': {
            'transform': 'vuetify/es5/components/${member}',
            'preventFullImport': true
          }
        }]
      ]
    },
    // 禁用css sourcemap
    cssSourceMap: false,
    /*
     ** Run ESLint on save
     */
    extend(config, {
      isDev,
      isClient,
      isServer
    }) {
      if (!isDev) return
      if (isClient) {
        // 启用source-map
        // config.devtool = 'eval-source-map'
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          options: {
            formatter: require("eslint-friendly-formatter"),
            fix: true,
            cache: true
          }
        })
      }
      if (isServer) {
        const nodeExternals = require('webpack-node-externals')
        config.externals = [
          nodeExternals({
            whitelist: [/^vuetify/]
          })
        ]
      }
    }
  }
}
