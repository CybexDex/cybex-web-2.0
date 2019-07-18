import { invert, cloneDeep, find, merge, keyBy } from 'lodash'
import { g } from "~/lib/cybex_help"
import config from "~/lib/config/config.js";
// 用户页面显示/行为/控件交互的设置
export const state = () => ({
  memokey: null,  // 查看memo的一个key
  icons: null,
  bases:null,
  coins:null,
  whitelist: null,
  assets: null,
  total: {
    balance: 0,
    value: 0
  },
  inited: false,
  withdraw: null,
  deposit: null,
  versionFlag: null, // 版本弹窗
  noticeFlag: null,  // 交易大赛弹窗
  assetTab: 0,
  pairs: null,
  userAssets: null,  // 用户所有资产信息
  transferTo: {
    name: '',
    id: ''
  },
  assetConfig: null,
  topAssets: [],
  customAssets: []
})

export const getters = {
  bases: state => state.bases,
  coins: state => state.coins,
  coinsInvert: state => invert(state.coins),
  whitelist: state => invert(state.coins),
  icons: state => state.icons,
  assets: state => state.assets,
  total: state => state.total,
  inited: state => state.inited,
  withdraw: state => state.withdraw,
  deposit: state => state.deposit,
  versionFlag: state => state.versionFlag,
  noticeFlag: state => state.noticeFlag === 'false' ? false : true ,
  assetTab: state => {
    return state.assetTab
  },
  pairs: state => state.pairs,
  userAssets: state => state.userAssets, 
  memokey: state => state.memokey,
  transferTo: state => state.transferTo,
  assetConfig: state => state.assetConfig,
  assetConfigBySymbol: state => {
    return keyBy(state.assetConfig || [], 'cybname')
  },
  assetConfigByName: state => {
    return keyBy(state.assetConfig || [], 'name')
  },
  assetConfigById: state => {
    return keyBy(state.assetConfig || [], 'cybid')
  },
  topAssets: state => state.topAssets,
  customAssets: state => state.customAssets,
  customAssetsInvert: state => invert(state.customAssets)
}

export const mutations = {
  setBases(state,bases){
    state.bases = bases
  },
  SET_COIN(state, coins){
    state.coins = coins
  },
  // SET_WHITELIST(state, { whitelist }) {
  //   state.whitelist = whitelist;
  // },
  SET_ASSET_CONFIG(state, { assetConfig, topAssets }) {
    state.assetConfig = assetConfig
    state.topAssets = topAssets
  },
  SET_ICONS (state, icons) {
    state.icons = icons
  },
  SET_ASSETS (state, assets) {
    state.assets = assets
  },
  SET_TOTAL (state, total) {
    state.total = total
  },
  SET_INITED (state, val) {
    state.inited = val;
  },
  SET_VERSION_FLAG(state, { username, flag }) {
    console.log('SET_VERSION_FLAG', flag)
    state.versionFlag = flag
    localStorage.setItem(`${username}_noversion`, flag)
  },
  SET_NOTICE_FLAG(state, { username, flag, save }) {
    console.log('SET_NOTICE_FLAG', flag)
    state.noticeFlag = flag;
    if (save) {
      localStorage.setItem(`${username}_no_notice`, flag)
    }
  },
  
  UPDATE_ASSET_TAB: function (state, {username, tab}) {
    state.assetTab = tab
    localStorage.setItem(`${username}_assettab`, tab)
  },
  SET_PAIRS: function(state, pairs) {
    state.pairs = Object.assign({}, pairs);
  },
  SET_USER_ASSETS (state, assets) {
    state.userAssets = assets
  },
  SET_MEMO_KEY (state, key) {
    state.memokey = key || 'empty'
  },
  CLEAR_MEMO_KEY (state) {
    state.memokey = null
  },
  SET_TRANSFER_TO (state, user) {
    state.transferTo = user
  },
  SET_CUSTOM_ASSETS (state, assets) {
    state.customAssets = assets
  }
}

export const actions = {
  async load_coinmap ({ commit, state }) {
    if (!state.coins) {
      const coins = await g.coin_id2name()
      // const t = invert(dic);
      // console.log('load_coinmap', dic);
      commit('SET_COIN', coins)
      // commit('SET_WHITELIST', { whitelist: t });
    }
  },
  async load_icons ({ commit, state }) {
    if (!state.icons) {
      const icons = {}
      for (const assetid in state.coins) {
        icons[assetid] = await g.asset_icon(assetid)
      }
      commit('SET_ICONS', icons)
    }
  },
  async load_bases ({ commit, state }) {
    if (!state.bases) {
      const bases = await g.loadBases()
      // console.log('load_bases', bases);
      commit('setBases', bases)
    }
  },
  async init ({ dispatch, commit }) {
    // console.log('start init')
    await Promise.all([
      await dispatch('load_coinmap'),
      await dispatch('load_icons'),
      await dispatch('load_bases'),
    ])
    commit('SET_INITED', true)
  },
  async setTotal ({ state, commit }, total) {
    commit('SET_TOTAL', total)
  },
  async loadAssetConfig ({ commit }) {
    const topAssets = await g.top_asset()
    const assetConfig = await g.gateway.asset_list()
    commit('SET_ASSET_CONFIG', { assetConfig, topAssets })
  },
  async loadAssets ({ state, commit }, username) {
    const userAssets = await g.balances(username)
    const newArr = new Array()
    const assets = await g.loadConfigedAssets()
    // 不使用余额与资产配置的并集，否则余额里的量子足球等资产没过滤

    for (var i = 0; i < assets.length; i++) {
      let assetId = assets[i];
      let a = find(userAssets, { asset_type: assetId });
      if (!a) { // do not find
        a = new Object()
        a.asset_id = assetId
        a.asset_type = assetId
        a.balance = 0
        a.frozenBalance = 0
      }
      const assetCfg = (state.assetConfig || []).find(o => o.cyid === assetId ) || {}
      newArr.push(merge(a, assetCfg))
    }
    commit('SET_ASSETS', newArr)
    commit('SET_USER_ASSETS', userAssets)
  },
  // async updateCoinMap ({ state, commit }) {
  //   const tmap = cloneDeep(state.coins)
  //   const tmapInvert = cloneDeep(state.coinsInvert)
  //   await Promise.all(state.userAssets.map(async i => {
  //     if (state.assets.indexOf(i.asset_type) === -1) {
  //       const info = await g.queryAsset(i.asset_type)
  //       tmap[i.asset_type] = info.symbol
  //       tmapInvert[info.symbol] = i.asset_type
  //     }
  //   }))
  //   commit('SET_COIN', { coins: tmap, coinsInvert: tmapInvert })
  // },
  loadVersionFlag ({ commit }, username) {
    const flag = localStorage.getItem(`${username}_noversion`)
    if (flag) {
      commit('SET_VERSION_FLAG', { username, flag: JSON.parse(flag) })
    }
  },
  loadNoticeFlag ({ commit }, username) {
    let flag = localStorage.getItem(`${username}_no_notice`);
    if (flag === null) {
      flag = 'false';
    }
    commit('SET_NOTICE_FLAG', { username, flag: flag })
  },
  async loadAssetTab ({ commit }, username) {
    const tab = parseInt(localStorage.getItem(`${username}_assettab`))
    if (tab === 0 || tab === 1) {
      commit('UPDATE_ASSET_TAB', {username: username, tab: tab})
    }
  },
  async queryCustomAssets ({ state, commit }) {
    const customAssets = {}
    const assetMap = keyBy(state.assets, 'asset_id')
    await Promise.all(state.userAssets.map(async (o) => {
      const id = o.asset_type
      if (!assetMap[id]) {
        const ret = await g.queryAsset(id)
        customAssets[id] = ret.symbol
      }
    }))
    commit('SET_CUSTOM_ASSETS', customAssets)
    return customAssets
  }
}