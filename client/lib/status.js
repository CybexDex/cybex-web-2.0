var cache = require('js-cache');
import config from './config/config.js'
function call_service(name,second){
    cache.set(config.status_cache[name]+"call","1",second*1000)
}
function back_service(name,second){
    cache.set(config.status_cache[name]+"back","1",second*1000)
}
function status(name){
  if (cache.get(config.status_cache[name]+"call") && !cache.get(config.status_cache[name]+"back")){
    return false
  }else{
    return true
  }
}

export default {
  status,
  call_service,
  back_service
}