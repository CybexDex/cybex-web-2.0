export default function ({ isHMR, store, params}) {
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return;
  
  let currency = /^([a-zA-Z]*[\.]*[a-zA-Z]*)_([a-zA-Z]*[\.]*[a-zA-Z]*)$/g.exec(params.currency);
  // 默认跳转配置文件中的第一个交易对
  if (!currency) {
    store.dispatch("exchange/redirectToDefault");
  } else if (currency) {
    store.commit("exchange/SET_CURRENCY", {
      base: currency[2],
      quote: currency[1]
    });
    store.commit("exchange/SET_IS_CONTEST", false);
  }
}