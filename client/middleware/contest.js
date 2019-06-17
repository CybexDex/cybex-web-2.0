export default async function ({ isHMR, store, params}) {
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return;
  
  let pairs = /^([a-zA-Z]*[\.]*[a-zA-Z]*)_([a-zA-Z]*[\.]*[a-zA-Z]*)$/g.exec(params.pairs);
  // 默认跳转配置文件中的第一个交易对
  if (!pairs) {
    await store.dispatch("exchange/redirectToDefault", { path: 'contest' });
  } else if (pairs) {
    store.commit("exchange/SET_CURRENCY", {
      base: pairs[2],
      quote: pairs[1]
    });
    store.commit("exchange/SET_IS_CONTEST", true);
  }
}