import { find } from 'lodash'

export default function ({ isHMR, app, store, params, error, route, redirect }) {
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return
  const storeLocale = store.getters['i18n/locale']
  const locale = params.lang || app.i18n.fallbackLocale
  // Get locale from params
  const localeData = find(store.state.i18n.locales, one => one.name === locale || one.code === locale)
  if (!localeData) {
    return error({ message: app.i18n.t('errorMessage.404'), statusCode: 404 })
  }
  const isLogin = store.getters['auth/username'];
  // 已登录时 不可访问注册 登录 恢复本地钱包
  // 并默认跳转到交易所页面
  const notAllowedPaths = [
    'register',
    'guide'
  ];
  const shouldRedirectPaths = [
    `/${locale}/`,
    '/',
    '/settings/restore'
  ];
  const checkRedirect = notAllowedPaths.filter(path => route.path.indexOf(path) > -1);
  const shouldRedirect = shouldRedirectPaths.filter(path => {
    return route.path == path || `/${locale}${path}` == route.path
  });
  if (isLogin && (checkRedirect.length || shouldRedirect.length) ){
    return redirect(`/${localeData.name}/exchange`)
  }
  if (route.name) {
    if (route.name.indexOf('fund-transfer') > -1 && !params.cointype) {
      return redirect(`/${localeData.name}/fund/transfer/${store.state.exchange.defaultAsset}`)
    }
    if (route.name.indexOf('fund-withdraw') > -1 && (!params.cointype || params.cointype === 'CYB')) {
      return redirect(`/${localeData.name}/fund/withdraw/${store.state.exchange.defaultAsset}`)
    }
    if (route.name.indexOf('fund-deposit') > -1 && (!params.cointype || params.cointype === 'CYB')) {
      return redirect(`/${localeData.name}/fund/deposit/${store.state.exchange.defaultAsset}`)
    }
    // 转账跨币种保留账户名
    if (route.name.indexOf('transfer-cointype') === -1) {
      store.commit('user/SET_TRANSFER_TO', {
        name: '',
        id: ''
      })
    }
  }
  // 主页自动跳转
  if (route.path === '/') {
    return redirect(`/${localeData.name}/`)
  }
  // Set locale
  if (storeLocale !== localeData.name) {
    store.commit('i18n/SET_LANG', localeData.name)
    app.i18n.locale = localeData.code || localeData.name
  }
}
