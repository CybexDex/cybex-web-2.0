import { clone } from 'lodash'

export const state = () => ({
  basequote: {},
  customPair: {}
})

export const getters = {
  basequote: state => state.basequote,
  customPair: state => state.customPair
}

export const mutations = {
  PUT_BOOKMARK (state, {username, key}) {
    const name = key
    // console.log('PUT_BOOKMARK', username, name)
    const newval = clone(state.basequote)
    newval[name] = !newval[name]
    state.basequote = newval
    localStorage.setItem(`${username || ''}_bookmarked`, JSON.stringify(newval))
  },
  LOAD_BOOKMARK (state, username) {
    const bookmarked = localStorage.getItem(`${username || ''}_bookmarked`)
    // console.log('bookmark', username);
    state.basequote = JSON.parse(bookmarked) || {}
  },
  PUT_CUSTOM_PAIR (state, {username, key}) {
    const name = key
    const newval = clone(state.customPair)
    if (!!newval[name]) {
      delete newval[name]
    } else {
      newval[name] = true
    }
    state.customPair = newval
    localStorage.setItem(`${username || ''}_custompair`, JSON.stringify(newval))
  },
  LOAD_CUSTOM_PAIR (state, username) {
    const customPair = localStorage.getItem(`${username || ''}_custompair`)
    // console.log('custompair', username);
    state.customPair = JSON.parse(customPair) || {}
  }
}