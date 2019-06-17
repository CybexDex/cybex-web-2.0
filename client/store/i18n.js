import moment from 'moment'
import { find } from 'lodash'

export const state = () => ({
  locales: [
    { name: 'en', label: 'English', shortcut: 'en', symbol: '$' },
    { name: 'zh', label: '简体中文', code: 'zh-cn', shortcut: 'cn', symbol: '￥' }
    // { name: 'ja', label: '日本語', shortcut: 'ja' }
  ],
  locale: null,
  localeLabel: null,
  shortcut: null,
  symbol: null
})

export const getters = {
  locale: state => { return state.locale },
  localeLabel: state => { return state.localeLabel },
  shortcut: state => { return state.shortcut },
  locales: state => state.locales.map(i => {
    return {
      title: i.label,
      code: i.name
    }
  }),
  symbol: state => state.symbol
}

export const mutations = {
  SET_LANG (state, locale) {
    const localeData = find(state.locales, { name: locale })
    if (!localeData) return
    state.locale = localeData.name
    state.localeLabel = localeData.label

    moment.locale(localeData.code || localeData.name)
    state.shortcut = localeData.shortcut
    state.symbol = localeData.symbol;
  },
}

export const actions = {

}
