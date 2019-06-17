import {
  promisify,
  throw_err,
  selectNode
} from './utils'
import config from './config/config'
import status from './status'
let ws
let ws_status
let idnum = 1
let cb_dic = {}
let timer = null
let open_cbs = []
let log = function (...args) {
  // console.log("order_server:", ...args)
}
let filterNow = ""
let filters = {
  "white":true,
  "custom":false,
  "game":true
}
// console.log("filters",filters)
async function start(cb) {
  if (ws_status !== "open") {
    open_cbs.push(cb)
  } else {
    cb(null, null)
    return
  }
  if (ws) {
    return
  }
  let bestNode = config.Order_server
  if (typeof config.Order_server === 'object'){
     bestNode = await selectNode(config.Order_server)
     log("bestNode",bestNode)
  }
  if (ws) {
    return
  }
  ws = new WebSocket(bestNode);
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
    log("order ws onopen")
    let login = `{"jsonrpc": "2.0", "method":"call", "params":[1, "limit_order_status", []], "id":4} `
    ws.send(login)
    if (config.whitePairs){
      easysend("add_filtered_market",[config.whitePairs])
    }
  }
  ws.onmessage = function (evt) {
    if (evt.data === `{"id":4,"jsonrpc":"2.0","result":2}`) {
      ws_status = "open"
      timer = setInterval(() => {
        ws.send("ping")
      }, 3000);
      for (let x of open_cbs) {
        x(null, null)
      }
      open_cbs = []
    } else {
      try {
        let data = JSON.parse(evt.data)
        if (cb_dic[data.id]) {
          status.back_service("order", 5)
          cb_dic[data.id](null, data["result"])
        }
      } catch (e) {
        console.error(e)
      }

    }
  }
  setTimeout(() => {
    if (ws_status !== "open") {
      cb(new Error("order server timeout"), null)
    }
  }, 4000)
}
let startP = promisify(start)
async function tryclose() {
  try {
    ws.close()
  } catch (e) {}
  try {
    clearInterval(timer)
  } catch (e) {

  }
  ws_status = null
  timer = null
  ws = null
}
function easysend(name, args, cb) {
  let sender = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": [2, name, args],
    "id": 1
  }
  let str_send = JSON.stringify(sender)
  ws.send(str_send)
}
function send(name, args, cb) {
  status.call_service("order", 10)
  idnum = idnum + 1
  let reqid = idnum
  let sender = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": [2, name, args],
    "id": reqid
  }
  let str_send = JSON.stringify(sender)
  ws.send(str_send)
  cb_dic[reqid] = cb
}
let sendP = promisify(send)
async function raworder(apiName, ...args) {
  if (ws_status !== "open") {
    await startP()
  }
  let s = await sendP(apiName, args)
  return s
}
async function get_filtered_limit_order_status(accountID,lastID,limit,filterFlag){
  if (ws_status !== "open") {
    await startP()
  }
  if (filterFlag == filterNow){
   
  }else{
    easysend("clear_filtered_market",[])
    if (filterFlag == "white"){
      easysend("add_filtered_market",[config.whitePairs])
      filterNow = "white"
    }
    if (filterFlag == "custom"){
      let arr = (config.whitePairs || []).concat(config.gamePairs || [])
      easysend("add_filtered_market",[arr])
      filterNow = "custom"
    }
    if (filterFlag == "game"){
      easysend("add_filtered_market",[config.gamePairs])
      filterNow = "game"
    }
  }
  return await raworder("get_filtered_limit_order_status",accountID,lastID,limit,filters[filterNow])
}
export default {
  raworder,
  get_filtered_limit_order_status
}
