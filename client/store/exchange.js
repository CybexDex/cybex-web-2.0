import pair from '../lib/pair_config.js'
import { get, keys } from 'lodash';
import { g } from '~/lib/cybex_help';
import config from '~/lib/config/config.js';

export const state = () => ({
  prefix: config.appconfig.gatewayUser.asset_prefix,
  gamePrefix: config.game_prefix,
  isGameActive: true,
  assetIsCustom: false,
  isContest: false, // 是否是交易大赛
  baseCurrency: null,
  baseId: null,
  baseIsCustom: false,
  baseDigits: null,
  quoteCurrency: null,
  quoteId: null,
  quoteIsCustom: false,
  quoteDigits: null,
  isConnect: false,
  pair: pair,
  defaultAsset: "JADE.USDT",
  priceDigits: null,
  tradesRefreshRate: 3000, // 频率 ms
  volume24h: null, //24小时成交量,
  currentRTEPrice: null, //当前成交价格
  currentRTELegalPrice: null, //当前成交法币价格
  netstatus: {
    market: false,
    tradeConnect: true,
    orderConnect: true,
    trade: false,
    order: false,
    history: false
  },
  innerWidth: null,
})

export const getters = {
  base: state => state.baseCurrency,
  game_prefix: state => state.gamePrefix,
  is_game_active: state => state.isGameActive,
  asset_is_custom: state => state.assetIsCustom,
  is_contest: state => state.isContest,
  base_is_custom: state => state.baseIsCustom,
  base_id: state => state.baseId,
  base_digits: state => state.baseDigits,
  quote: state => state.quoteCurrency,
  quote_is_custom: state => state.quoteIsCustom,
  quote_digits: state => state.quoteDigits,
  quote_id: state => state.quoteId,
  connect: state => state.isConnect,
  pair: state => state.pair,
  tradesRefreshRate: state => state.tradesRefreshRate,
  defaultAsset: state => state.defaultAsset,
  priceDigits: state => state.priceDigits,
  volume24h: state => state.volume24h,
  currentRTEPrice: state => state.currentRTEPrice,
  currentRTELegalPrice: state => state.currentRTELegalPrice,
  netstatus: state => state.netstatus,
  prefix: state => state.prefix,
  innerWidth: state => state.innerWidth
}

export const mutations = {
  SET_CONNECT(state, connect) {
    state.isConnect = connect
  },
  SET_CURRENCY(state, currency) {
    state.baseCurrency = currency.base
    state.quoteCurrency = currency.quote
  },
  SET_BASE_ID(state, id) {
    state.baseId = id
  },
  SET_ASSET_IS_CUSTOM(state, val) {
    state.assetIsCustom = val;
  },
  SET_BASE_IS_CUSTOM(state, val) {
    state.baseIsCustom = val;
  },
  SET_BASE_DIGITS(state, val) {
    state.baseDigits = val;
  },
  SET_QUOTE_ID(state, id) {
    state.quoteId = id
  },
  SET_QUOTE_DIGITS(state, val) {
    state.quoteDigits = val
  },
  SET_QUOTE_IS_CUSTOM(state, val) {
    state.quoteIsCustom = val;
  },
  SET_PRICE_DIGITS(state, digits) {
    state.priceDigits = digits
  },
  SET_24h_VOLUME(state, price) {
    state.volume24h = price;
  },
  SET_CURRENT_RTE_PRICE(state, { price, legalPrice }) {
    state.currentRTEPrice = price;
    state.currentRTELegalPrice = legalPrice;
  },
  SET_MDP_CONNECT_STATUS(state, status) {
    state.netstatus = Object.assign(state.netstatus, { market: status });
  },
  SET_CONNECT_STATUS(state, connect) {
    let newConnect = Object.assign(state.netstatus, connect);
    newConnect.history = newConnect.tradeConnect && newConnect.orderConnect;
    state.netstatus = newConnect;
  },
  SET_NETSTATUS(state, status) {
    let newStatus = Object.assign(state.netstatus, status);
    if (state.netstatus.orderConnect && state.netstatus.tradeConnect) {
      newStatus.history = newStatus.trade && newStatus.order;
    }
    state.netstatus = newStatus;
  },
  SET_INNER_WIDTH(state, val) {
    state.innerWidth = val
  },
  SET_IS_CONTEST(state, val) {
    state.isContest = val;
  },
  SET_IS_GAME_ACTIVE(state, val) {
    state.isGameActive = val
  }
}



export const actions = {
  async redirectToDefault({state, rootState}, params) {
    // confirm route param BE WITH prefix!
    const checkDefaultPrefix = (assetName) => {
      if (!assetName) return false;
      const list = config.appconfig.gatewayUser.asset_default_no_prefix;
      return list && list.indexOf(assetName) > -1;
    }
    const path = params && params.path ? params.path : 'exchange';
    let url;
    let toBase = '';
    let toQuote = '';
    if (path == 'exchange') {
      // 默认交易对改为优先远程pairs.json
      const pair = rootState.user.pairs ? rootState.user.pairs : pair;
      const firstBase = keys(pair);
      const firstQuote = keys(pair[firstBase[0]]);
      const prefix = state.prefix; 
      toBase = checkDefaultPrefix(firstBase[0]) ? firstBase[0] : prefix + firstBase[0];
      toQuote = checkDefaultPrefix(firstQuote[0]) ? firstQuote[0] : prefix + firstQuote[0];
    } else if (path == 'contest') {
      const [quote_id, base_id] = config.gamePairs ? config.gamePairs[0]: [];
      if (!quote_id || !base_id) {
        console.error('no game pairs found');
      } else {
        const r1 = await g.queryAsset(quote_id);
        toQuote = r1.symbol;
        const r2 = await g.queryAsset(base_id);
        toBase = r2.symbol;
      }
    }
    url = `/${rootState.i18n.locale}/${path}/${toQuote}_${toBase}`
    console.log('redirect to ' + url);
    this.$router.push(url);
  },
  async init({ rootState, state, commit, dispatch }) {
    let quote_id = get(rootState.user.whitelist, state.quoteCurrency);
    let base_id = get(rootState.user.whitelist, state.baseCurrency);
    let quoteInfo = {};
    let baseInfo = {};
    // 非默认资产，根据名字查询id
    const rq = await g.queryAsset(state.quoteCurrency);
    if (!quote_id) {
      quote_id = rq ? rq.id : null;
      quoteInfo['is_custom'] = true;
    } else {
      quoteInfo['is_custom'] = false;
    }
  
    // 非默认资产，根据名字查询id
    const rb = await g.queryAsset(state.baseCurrency)
    if (!base_id) {
      base_id = rb ? rb.id : null;
      baseInfo['is_custom'] = true;
    } else {
      baseInfo['is_custom'] = false;
    }
    
    if (!base_id || !quote_id) {
      console.error('no base found');
      dispatch('redirectToDefault');
    }
    baseInfo['id'] = base_id;
    baseInfo['symbol'] = rb ? rb.symbol : ''; 
    baseInfo['digits'] = rb ? rb.precision : null;

    quoteInfo['id'] = quote_id;
    quoteInfo['symbol'] = rq ? rq.symbol : null;
    quoteInfo['digits'] = rq ? rq.precision : null;

    // base_id 大小顺序
    let findBase = await g.findBase(base_id, quote_id);
    console.log('search base id', findBase, base_id);
    // 跳转为正确顺序
    if (findBase != base_id) { 
      console.log('redirect to ', `/${rootState.i18n.locale}/exchange/${baseInfo.symbol}_${quoteInfo.symbol}`)
      this.$router.push(`/${rootState.i18n.locale}/exchange/${baseInfo.symbol}_${quoteInfo.symbol}`);
    }

    // 交易对是否是默认
    let isDefaultAsset = false;
    if (rootState.user.bases && rootState.user.bases[base_id] && rootState.user.bases[base_id].data) {
      isDefaultAsset = rootState.user.bases[base_id].data.indexOf(quote_id) > -1;
    }

    commit('SET_BASE_IS_CUSTOM', baseInfo.is_custom);
    commit('SET_QUOTE_IS_CUSTOM', quoteInfo.is_custom);
    commit('SET_BASE_DIGITS', baseInfo.digits);
    commit('SET_QUOTE_DIGITS', quoteInfo.digits); 
    commit('SET_ASSET_IS_CUSTOM', !isDefaultAsset);
    commit('SET_BASE_ID', baseInfo.id);
    commit('SET_QUOTE_ID', quoteInfo.id);
  },
}
