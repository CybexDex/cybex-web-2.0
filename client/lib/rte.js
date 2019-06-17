import {
  promisify,
  throw_err
} from './utils'
import status from "./status"
import config from './config/config'

let topic_dic = {
  "depth": null,
  "ticker": null
}
let dic = {}
let ws = null
let ws_status
let open_cbs = []
let task_count = {}
let log = function (...args) {
  // console.log("rte:", ...args)
}

function start_c(cb) {
  task_count["depth"] = 0
  task_count["ticker"] = 0
  if (ws_status !== "open") {
    open_cbs.push(cb)
  } else {
    cb(null, null)
  }
  if (ws) {
    return
  }
  ws = new WebSocket(config.RTE_server);
  ws_status = "opening"
  ws.onclose = function (evt) {
    log("onclose", evt)
    tryclose()
  }
  ws.onerror = function (evt) {
    log("onerror", evt)
    tryclose()
  }
  ws.onopen = function (evt) {
    log("MDP ws onopen")
    ws_status = "open"
    topic_dic = {

    }
    for (let x of open_cbs) {
      x(null, null)
    }
    open_cbs = []
  }
  ws.onmessage = function (evt) {
    let x = JSON.parse(evt.data)
    if (x.topic !== topic_dic["depth"] && x.topic !== topic_dic["ticker"]) {
      let msg = `{"type":"unsubscribe","topic":"${x.topic}"}`
      log("unsubscribe", x.topic)
      ws.send(msg)
    }
    if (x.topic) {
      status.back_service("mdp", 1)
      if (x.topic.indexOf("ORDERBOOK")!==-1){
        task_count["depth"] = task_count["depth"] + 1
        if (task_count["depth"] > 6) {
          log("no body want MDP..closing")
          stopDepth(ws)
        }
      }
      dic[x.topic] = x
    }
  }
  setTimeout(() => {
    if (ws_status !== "open") {
      console.error("ws_status", ws_status)
      let err_pre = config.error.pre + "."
      let e = new Error(err_pre + "S.timeout.MDP")
      cb(e, null)
    }
  }, 4000)
}
let start = promisify(start_c)
async function tryclose() {
  try {
    ws.close()
  } catch (e) {}
  ws_status = null
  ws = null
}

function send(flag, topic) {
  if (topic_dic[flag] == topic) {
    return 0
  } else {
    if (topic_dic[flag] !== topic) {
      dic[topic_dic[flag]] = null
    }
    let msg = `{"type":"subscribe","topic":"${topic}"}`
    try {
      ws.send(msg)
      topic_dic[flag] = topic
    }catch(e){

    }
    return 1
  }
}
async function depth(num, precision, market) {
  status.call_service("mdp", 10)
  await start()
  let topic = `ORDERBOOK.${market}.${precision}.${num}`
  let topic2 = `LASTPRICE.${market}`
  let c1 = send("depth", topic)
  let c2 = send("ticker", topic2)
  if (topic === topic_dic["depth"] && dic[topic] ) {
    // 直接拿，拿不到重启
    let s = dic[topic]
    let s2 = dic[topic2]
    if (s2){
      s.price = s2.px
    }else{
      s.price = null
    }
    return s
  }
  return {}
  // throw_err("S.rte.depth")
}

function stopDepth(ws) {
  topic_dic["depth"] = null
  topic_dic["ticker"] = null
  try {
    ws.close()
    log("MDP stoped")
  } catch (e) {

  }
}
export default {
  depth
}
