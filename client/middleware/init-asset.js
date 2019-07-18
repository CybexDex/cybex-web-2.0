import { isEmpty, values } from 'lodash'

export default async function ({ isClient, isHMR, app, store, params, error, route, redirect }) {  
  let assetConfig = store.getters['user/assetConfigBySymbol']
  try {
    if (isEmpty(assetConfig)) {
      await store.dispatch('user/loadAssetConfig')
      assetConfig = store.getters['user/assetConfigBySymbol']
    }
    const cointype = params.cointype
    if (route.name.startsWith('lang-fund') && cointype) {
      const cfgData = assetConfig[cointype] || {}
      const [ _, __, fundtype ] = route.name.split('-')
      if (fundtype === 'transfer') {
        // fetch info of custom assets
        if (!store.getters['user/assets']) {
          const username = store.getters['auth/username']
          await store.dispatch('user/loadAssets', username)
        }
        await store.dispatch('user/queryCustomAssets')
        const userAssets = store.getters['user/userAssets']  
        const coinsInvert = store.getters['user/coinsInvert']
        const coins = store.getters['user/coins']
        const customAssets = store.getters['user/customAssets']
        const customAssetsInvert = store.getters['user/customAssetsInvert']
        const assetId = coinsInvert[cointype] || customAssetsInvert[cointype]
        // search asset with balance over 0 when params.cointype not valid
        let asset = userAssets.find(i => i.asset_type === assetId)
        if (!asset) {
          const asset_id = (userAssets.find(i => parseFloat(i.balance) > 0) || {}).asset_type
          const coinname = coins[asset_id] || customAssets[asset_id]
          if (coinname) {
            redirect(app.i18n.path(`/fund/transfer/${coinname}`))
          }
        }
      } else if (!cfgData[`${fundtype}Switch`]) {
        const newAssetItem = values(assetConfig).find(o => o[`${fundtype}Switch`])
        if (newAssetItem) {
          redirect(app.i18n.path(`/fund/${fundtype}/${newAssetItem.cybname}`))
        }
      }
    }
  } catch (e) {
    console.log(e, route.name)
    if (route.name.startsWith('lang-fund-deposit') || route.name.startsWith('lang-fund-withdraw')) {
      throw Error({ statusCode: 500 })
    }
  }
}
