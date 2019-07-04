
let axios = require("axios")
/**
 * @typedef {import('./types').Asset} Asset
 * @typedef {import('./types').Record} Record
 * @typedef {import('./types').Signer} Signer
 * @typedef {import('./types').RecordDesc} RecordDesc
 */

 /**
  * @async
  * @param {string} url 
  * @param {string | null} [token]
  * @return {Promise<object>} some 
  */
async function getUrl(url,token){
  // @ts-ignore
  let r = await axios.get(url, {
    headers:{
      'Authorization': `Bearer ${token}`
    }
  })
  if (r.status == 200) {
    return r.data
  }
}
export class Gateway {
  /**
   * 
   * @param {string} gatewayUrl 
   * @param {Signer} signer 
   */
  constructor(gatewayUrl,signer){
    this.gatewayUrl = gatewayUrl
    this.signer = signer
  }
  test(){
    console.log("this is a gateway test")
  }
  /**
   * 从网关获取支持的资产列表
   * @async
   * @return {Promise<Asset[]>} assetlist
   */
  async asset_list(){
    //从网关地址获取asset_list
    let url = this.gatewayUrl + "/v1/assets"
    let obj = await getUrl(url)
    /**
     * @type {Asset[]} 
     */
    return obj
  } 
  /**
   * @async
   * @param {string} assetname 
   * @return {Promise<Asset>} asset
   */
  async get_asset(assetname){
    let url = this.gatewayUrl + `/v1/assets/${assetname}`
    /**
     * @type {Asset} 
     */
    let obj = await getUrl(url)
    return obj
  } 
  /**
   * 
   * @param {string} username 
   * @param {string} assetname 
   * @return {Promise<string>} address
   */
  async user_address(username,assetname){
    
    let url = this.gatewayUrl + `/v1/users/${username}/assets/${assetname}/address`
    var s = parseInt((new Date()).getTime()/1000 + "") + ""
    let token = this.signer.signStr(s+username)
    
    let tokenall  = `${s}.${username}.${token}`
    try {
      let obj = await getUrl(url,tokenall)

      if(obj.asset !==assetname ){
        throw new Error("UB.Gateway.GetAddressError")
      }
      let address = obj.address
      
      return address
    }catch(e){
      console.error("user_address",e)
      throw new Error("UB.Gateway.GetAddressError")
    }
  } 
  /**
   * @param {string} coin  ETH
   * @param {string} address 0xC3ABEBBAEf594f9ceCa420e3Bad4a45D457f60fa
   * @return {Promise<boolean>} isverify
   */
  async verify_addrss(coin,address){
    let url = this.gatewayUrl + `/v1/assets/${coin}/address/${address}/verify`
    let obj = await getUrl(url)
    /**
     * @type {boolean} 
     */
    let valid = obj.valid
    return valid
  }
  /**
   * 
   * @param {string} user "yangyu123"
   * @param {string} fundType "deposit"
   * @param {string} asset "ETH"
   * @param {string|number} size "10" 
   * @param {string|null} lastID 没有的话就不传
   * @return {Promise<Record[]>} recordlist
   */
  async get_user_records(user,fundType,asset,size,offset){
    let url = this.gatewayUrl + `/v1/users/${user}/records?fundType=${fundType || ''}&asset=${asset || ''}&size=${size || ''}&offset=${offset || 0}`
    var s = parseInt((new Date()).getTime()/1000 + "") + ""

    let token = this.signer.signStr(s+user)
    let tokenall  = `${s}.${user}.${token}`
    try {
      let obj = await getUrl(url,tokenall)
     /**
     * @type {Record[]} 
     */
      // let records = obj.records
      return obj
    }catch(e){
      console.error("get_user_records",e)
      throw new Error("UB.Gateway.get_user_records")
    }
  }
  /**
   * 
   * @param {string} user 
   * @return {Promise<RecordDesc[]>} recordDesc
   */
  async get_records_desc(user){
    let url = this.gatewayUrl + `/v1/users/${user}/assets`
    var s = parseInt((new Date()).getTime()/1000 + "") + ""

    let token = this.signer.signStr(s+user)
    let tokenall  = `${s}.${user}.${token}`
    try {
      let obj = await getUrl(url,tokenall)
     /**
     * @type {RecordDesc[]} 
     */
      let records = obj.records
      return records
    }catch(e){
      console.error("get_records_desc",e)
      throw new Error("UB.Gateway.get_records_desc")
    }
  }
}

