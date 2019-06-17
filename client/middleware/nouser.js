export default function ({ isClient, isHMR, app, store, params, error, route, redirect }) {  
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return

  const currUser = store.getters['auth/username']

  if (currUser === null) {
    const reg = /^\/((([\w-]+)\/?)?((exchange(\/[\w-\.]+)?)|(contest(\/[\w-\.]+)?)|register|settings\/restore|settings\/success\/restore)?)?$/
    if (!reg.test(route.path)) {
      return redirect(app.i18n.path('/' + '?from=' + route.path))
    }
  }
}
