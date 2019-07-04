import { g } from "~/lib/cybex_help"
import { isEmpty } from 'lodash'

export default async function ({ isClient, isHMR, app, store, params, error, route, redirect }) {  
  if (!store.getters['exchange/connect']) {
    await g.start()
  }
  if (!store.getters['user/inited']) {
    await store.dispatch('user/init')
  }
}
