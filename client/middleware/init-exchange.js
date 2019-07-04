import { g } from "~/lib/cybex_help"

export default async function ({ store }) {  
  if (!store.getters['exchange/inited']) {
    await store.dispatch('exchange/init')
  }
}