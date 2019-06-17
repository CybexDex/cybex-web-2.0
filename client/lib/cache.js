var cache = require('js-cache');
let cached = async function (name, func, isNew, seconds = 60) {
  if (isNew) {
    cache.del(name)
  }
  let s = cache.get(name)
  if (s) {
    // console.log('cache', name)
    return JSON.parse(s)
  }
  s = await func()
  if (s) {
    cache.set(name, JSON.stringify(s), seconds * 1000)
  }
  return s
}

export default cached
