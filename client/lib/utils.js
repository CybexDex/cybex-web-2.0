import config from './config/config.js'
export let promisify = (fn, receiver) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, res) => {
        return err ? reject(err) : resolve(res);
      }]);
    });
  };
};

export let throw_err = (msg)=>{
  let err_pre = config.error.pre + "."
  throw new Error(err_pre+msg)
}

export let random_id = ()=>{
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
 };
 return ("B"+S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
export let  selectNode = async(NODE_LIST) =>{
  let minDelay = Number.MAX_SAFE_INTEGER
  const promiseList = []
  for (let k in NODE_LIST) {
    const cs = NODE_LIST[k]
    promiseList.push(new Promise(function (resolve, reject) {
      // log('^^^^^^ create connection:', cs)
      const testSock = new WebSocket(cs)
      const preTime = Date.now()
      testSock.onopen = () => {
        const delay = Date.now() - preTime
        if (delay < minDelay) {
          minDelay = delay
        }
        // log('延迟：', cs, delay)
        resolve(cs)
      }
      testSock.onerror = (err) => {

      }
    }))
  }
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error('timeout'))
    }, 3000)
    Promise.race(promiseList).then(minCs => {
      // log('选取延迟最低的节点：', minCs, minDelay)
      resolve(minCs)
    })
  })
}