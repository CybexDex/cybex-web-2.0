var {
  PrivateKey,
  PublicKey,
  key,
  // compress,
  Aes,
} = require("cybexjs")
var _ = require("lodash")
let dictionary = require("./dictionary")
let axios = require("axios")
let moment = require("moment")
import config from './config/config.js'
import {compress, decompress } from "lzma";
import { g } from "./cybex_help";
let err_pre =  "ex2wallet."
async function register(user, pubKeys, code_id, code) {
  console.log(user, pubKeys, code_id, code)
  let hr
  console.log(user, pubKeys, code_id, code)
  try {
    hr = await axios.post(`${config.appconfig.faucet}/register`, {
      "cap": {
        "id": code_id,
        "captcha": code
      },
      "account": {
        "name": user,
        "owner_key": pubKeys[0],
        "active_key": pubKeys[1],
        "memo_key": pubKeys[1],
        "refcode": null,
        "referrer": null
      }
    });
  } catch (e) {
    console.error(e)
    if (e.response.data) {
      switch (e.response.data.error) {
        case "Faucet is not availiable for temporary":
          let cUser = await this.get_user(user)
          if (cUser) {
            throw new Error(err_pre + "UB.user_exist.register")
          }
          throw new Error(err_pre + "UB.ip.register")
        case "Only one account could be registered from a single IP, within 5 mins":
          throw new Error(err_pre + "UB.ip.register")
        case "Incorrect verify code":
          throw new Error(err_pre + "UB.code.register")
        default:
          throw new Error(err_pre + "S.faucet.register")
      }
    }
  }
  if (hr.status == 200) {
    return hr.data
  } else {
    throw new Error(err_pre + "S.faucet.register")
  }
}
/**
 * 
 * @param {string} binstr 
 * @param {string} password 
 * @return {binobject} binobject
 */
function unlock_bin(binstr, password) {

}
/**
 * 
 * @param {*} binobject 
 * @param {*} password 
 * @return {string} binstr
 */
function get_bin_str(binobject, password) {

}

/**
 * 
 * @param {*} binobject 
 * @param {*} password 
 * @return {string[]} usernames
 */
function get_bin_users(binobject) {

}
/**
 * 选择当前用户
 * @param {string} username 
 * @return {bool} isok
 */
function set_user(username) {

}
/**
 * 
 * @param {*} binobject 
 * @return {string} brain_key
 */
function get_brain_key(binobject) {

}
/**
 * 
 * @param {string} brain_key 
 * @param {string} wallet_name 
 * @param {string} password 
 * @return {binobject} binobject
 */
function import_brain_key(brain_key, wallet_name, password) {

}

function genPri(seed, prefix) {
  console.log(seed)
  let pkey = PrivateKey.fromSeed(seed)
  let pub = pkey.toPublicKey().toString(prefix)
  return {
    privKey: pkey,
    pubKey: pub
  }
}

function genPassword() {
  let keypass = (key.get_random_key().toWif()).substr(0, 44)
  let adds = "_"
  return "P" + _.shuffle(keypass + adds).join("")
}
function getBrainKeyPrivate(brainkey_plaintext = this.getBrainKey()) {
  if (!brainkey_plaintext) throw new Error("missing brainkey");
  return PrivateKey.fromSeed(key.normalize_brainKey(brainkey_plaintext));
}
function createWalletObject(password_plaintext,brainkey_plaintext, public_name = "default") {
  let brainkey_backup_date;
  if (brainkey_plaintext) {
    if (typeof brainkey_plaintext !== "string"){
      console.error("Brainkey must be a string");
      throw new Error(err_pre + "UB.Brainkey.fail")
    }

    if (brainkey_plaintext.trim() === ""){
      console.error("Brainkey can not be an empty string");
      throw new Error(err_pre + "UB.Brainkey.fail")
    }

    if (brainkey_plaintext.length < 50){
      console.error("Brainkey must be at least 50 characters long");
      throw new Error(err_pre + "UB.Brainkey.fail")
    }

    // The user just provided the Brainkey so this avoids
    // bugging them to back it up again.
    brainkey_backup_date = new Date();
  }
  let password_aes = Aes.fromSeed(password_plaintext);

  let encryption_buffer = key.get_random_key().toBuffer();
  // encryption_key is the global encryption key (does not change even if the passsword changes)
  let encryption_key = password_aes.encryptToHex(encryption_buffer);
  // If unlocking, local_aes_private will become the global aes_private object
  let local_aes_private = Aes.fromSeed(encryption_buffer);

  if (!brainkey_plaintext)
    brainkey_plaintext = key.suggest_brain_key(dictionary.en);
  else brainkey_plaintext = key.normalize_brainKey(brainkey_plaintext);
  let brainkey_private = getBrainKeyPrivate(brainkey_plaintext);
  let brainkey_pubkey = brainkey_private
    .toPublicKey()
    .toPublicKeyString();
  let encrypted_brainkey = local_aes_private.encryptToHex(
    brainkey_plaintext
  );

  let password_private = PrivateKey.fromSeed(password_plaintext);
  let password_pubkey = password_private
    .toPublicKey()
    .toPublicKeyString();

  let wallet = {
    public_name,
    password_pubkey,
    encryption_key,
    encrypted_brainkey,
    brainkey_pubkey,
    brainkey_sequence: 0,
    brainkey_backup_date,
    created: new Date(),
    last_modified: new Date(),
    chain_id: null//Apis.instance().chain_id
  }
  // console.log(wallet)
  return wallet
}
function getAesPrivate(password,encryption_key){
  let password_aes = Aes.fromSeed(password);
  let encryption_plainbuffer = password_aes.decryptHexToBuffer(
    encryption_key
  );
  let aes_private = Aes.fromSeed(encryption_plainbuffer);
  return aes_private
}
function getBrainKey(encrypted_brainkey,aes_private) {
  if (!encrypted_brainkey) throw new Error("missing brainkey");
  if (!aes_private) throw new Error("wallet locked");
  let brainkey_plaintext = aes_private.decryptHexToText(
    encrypted_brainkey
  );
  return brainkey_plaintext;
}
function generateBrainIndexKey(wallet_object,password,brainkey_sequence=0) {
  let brainkey = getBrainKey(wallet_object.encrypted_brainkey,getAesPrivate(password,wallet_object.encryption_key));
  let sequence = Math.max(brainkey_sequence, 0);
  let private_key = key.get_brainPrivateKey(brainkey, sequence);
  return { private_key, sequence };
}
function walletKeys(wallet_object,password){
  let ownerkey = generateBrainIndexKey(wallet_object,password,0)
  let activekey = generateBrainIndexKey(wallet_object,password,1)
  let key1 = getKeyObject(getAesPrivate(password,wallet_object.encryption_key),ownerkey.private_key,ownerkey.sequence)
  let key2 = getKeyObject(getAesPrivate(password,wallet_object.encryption_key),activekey.private_key,activekey.sequence)
  return [key1,key2]
}
function wifToKeys(wallet_object,password,wif,sequence){
  let privKey = PrivateKey.fromWif(wif)
  let key1 = getKeyObject(getAesPrivate(password,wallet_object.encryption_key),privKey,sequence)
  return key1
}
function getKeyObject(
    aes_private,
    private_key,
    brainkey_sequence,
    import_account_names,
    public_key_string,
  ) {
    let private_cipherhex = aes_private.encryptToHex(private_key.toBuffer());
    if (!public_key_string) {
      //S L O W
      // console.log('WARN: public key was not provided, this may incur slow performance')
      let public_key = private_key.toPublicKey();
      public_key_string = public_key.toPublicKeyString();
    } else if (public_key_string.indexOf(ChainConfig.address_prefix) != 0)
      throw new Error(
        "Public Key should start with " + ChainConfig.address_prefix
      );

    let private_key_object = {
      import_account_names,
      encrypted_key: private_cipherhex,
      pubkey: public_key_string,
      brainkey_sequence,
      id: brainkey_sequence+1
    };
    return private_key_object
  }
  async function decryptWalletBackup (backupWif, backupBuffer) {  
    let privKey = PrivateKey.fromWif(backupWif)
    let pubKey
    try {
      pubKey = PublicKey.fromBuffer(backupBuffer.slice(0, 33))
    } catch (e) {
      console.error(null, e, ['Failed-to-parse'])
    }
  
    // Main body of wallet
    let mainContent = backupBuffer.slice(33)
    let decryptedContent = Aes.decrypt_with_checksum(
      privKey, pubKey, null/* nonce */, mainContent)
    let walletObject = await new Promise(resolve =>
      decompress(decryptedContent, walletString => {
        resolve(JSON.parse(walletString))
      })
    )
    // console.log(JSON.stringify(walletObject))
    return walletObject
  }
  function getAesPrivateOfWallet (password, wallet) {
    let pwdPrivate = PrivateKey.fromSeed(password)
    let pwdPublic = pwdPrivate.toPublicKey().toPublicKeyString()
    if (wallet.password_pubkey.substr(3) !== pwdPublic.substr(3)) return false
    return decryptAesKey(password, wallet.encryption_key)
  }
  function decryptAesKey (password, cryptedKey) {
    let passwordAes = Aes.fromSeed(password)
    let encryptionPlainbuffer = passwordAes.decryptHexToBuffer(cryptedKey)
    let aesPrivate = Aes.fromSeed(encryptionPlainbuffer)
    return aesPrivate
  }
  function decryptKeysByWalletAes (aesPrivate, cryptedKey) {
    let privKeyBuffer = aesPrivate.decryptHexToBuffer(cryptedKey)
    let privKey = PrivateKey.fromBuffer(privKeyBuffer)
    return {
      privKey,
      pubKey: privKey.toPublicKey().toPublicKeyString()
    }
  }
class Wallet {
  constructor(total_obj) {
    this.total_obj = total_obj
  }
  getKeyPairs(password){
    if (!this.total_obj){
      throw new Error("没有钱包对象")
    }
    let wallet = this.total_obj.wallet[0]
    let aesPrivate = getAesPrivateOfWallet(password, wallet)
    let keys
    if (aesPrivate) {
      keys = this.total_obj.private_keys.map(privateKeyObj =>
        decryptKeysByWalletAes(aesPrivate, privateKeyObj.encrypted_key)
      )
    }
    return keys
  }
  checkPassword(password){
    let password_private = PrivateKey.fromSeed(password);
    let password_pubkey = password_private
      .toPublicKey()
      .toPublicKeyString();
      console.log(password_pubkey)
    return password_pubkey === this.total_obj.wallet[0].password_pubkey
  }
  addWifKey(password,wif){
    if (!this.total_obj){
      throw new Error(err_pre+ "UF.wallet.import.failed")
    }
    if (!this.checkPassword(password)){
      throw new Error(err_pre + "UF.wallet.password.failed")
    }
    let keys = this.total_obj.private_keys
    let key
    try {
       key = wifToKeys(this.total_obj.wallet[0],password,wif,keys.length)
    }catch(e){
      throw new Error(err_pre+ "UF.wallet.import.failed")
    }
    if (_.find(keys,{pubkey:key.pubkey})){
      throw new Error(err_pre + "UF.wallet.import.exist")
    }
    this.total_obj.private_keys.push(key)
    return true
  }
  getBrainKey(password) {
    let wallet = this.total_obj.wallet[0]
    if (!wallet.encrypted_brainkey) throw new Error("missing brainkey");
    console.log(password,wallet)
    let aesPrivate = getAesPrivateOfWallet(password, wallet)
    if (!aesPrivate) throw new Error("wallet locked");
    let brainkey_plaintext = aesPrivate.decryptHexToText(
      wallet.encrypted_brainkey
    );
    return brainkey_plaintext;
  }
  get_users() {
    console.log(this.x)
  }
  async exportBin() {
    let pubkey_str = this.total_obj.wallet[0].password_pubkey
    let public_key = PublicKey.fromPublicKeyString(pubkey_str);
    let onetime_private_key = key.get_random_key();
    var objout = Object.assign({},this.total_obj)
    if (objout["wallet_name"]){
      delete objout["wallet_name"]
    }
    let currentTime = moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
    let chainId = await g.get_chain_id()
    objout["wallet"] = objout["wallet"].map(w => {
      w.backup_date = currentTime
      w.chain_id = chainId
      return w
    })
    objout["linked_accounts"] = objout["linked_accounts"].map(a=>{
      a.chainId = chainId
      return a
    })
    // let walletString = `{"wallet":[{"public_name":"default","password_pubkey":"CYB7mRcPsb59zzph7FUz3LTPQKuXsqiLbs1LeX4vWafi8kKwQQAr9","encryption_key":"6ab0fe3a7b8a25e2aca3955bb1ac7189db491f0a9e7b9f48462b57c82403cba16e9588dc407cb978dbc3a08630a5f70e","encrypted_brainkey":"8323e811764675ea62f5c7d00da1698d1a96cc086744634252da9fd4f70d82a60b3f6abd642c83913cfedce5d7133a0914b4dde5d6d5766e10b84a55de5e81f9f923fc844e2d5344cb5e4cd4739a9a4d30edc9f0aa25295fc2c80301308a9fce5728c413e29aefe6ca0a1c8105ba4752","brainkey_pubkey":"CYB7YCtQC9y1hJRA5AvBZoa2NTbdFCPVJ5vLfR9Qu1CJyXFNF9Kfg","brainkey_sequence":2,"created":"2019-03-13T09:56:02.380Z","last_modified":"2019-03-13T09:56:02.777Z","chain_id":"90be01e82b981c8f201c9a78a3d31f655743b29ff3274727b1439b093d04aa23","id":"default","backup_date":"2019-03-13T09:56:21.684Z"}],"private_keys":[{"encrypted_key":"4016aeab51f26edddf027601481bcd727b85853b85f34cab4ae94cb3a1bffb0dc3245d4209e9ce3c07df508f0314cc7b","pubkey":"CYB7NzDxdepfaH9u2AVRWZmNN32NAaHAvPLfqvSpWJesQ1e254mRN","brainkey_sequence":0,"id":1},{"encrypted_key":"05d18ec73c7bec0e778e213f6495114dc4264b8d8bd50fedd48f4b0caae4cd38acd87992950862670828ba9a7ad1f881","pubkey":"CYB5mtkBFdLvK1FYmAswuvMRhogM6nhxw4H4ioXUdXRHhA8bKKTiC","brainkey_sequence":1,"id":2}],"linked_accounts":[{"name":"yangyulocal1","chainId":"90be01e82b981c8f201c9a78a3d31f655743b29ff3274727b1439b093d04aa23"}]}`
    let walletString = JSON.stringify( objout, null, 0);
    let compression_mode = 1
    return new Promise(resolve => {
      compress(walletString, compression_mode, compressedWalletBytes => {
        let backup_buffer = Aes.encrypt_with_checksum(
          onetime_private_key,
          public_key,
          null /*nonce*/ ,
          compressedWalletBytes
        );
    
        let onetime_public_key = onetime_private_key.toPublicKey();
        let backup = Buffer.concat([
          onetime_public_key.toBuffer(),
          backup_buffer
        ]);
        resolve(backup)
      });
    })
  }
  get_total_object() {
    return this.total_obj
  }
  set_user(user) {
    console.log(this.x)
  }
  get_brain_key(password) {

  }
  get_bin_str() {

  }
  static Create(user, password, code, code_id) {
    console.log(user, password, code, code_id)
    let userkeys = [genPri(genPassword()), genPri(genPassword())]
    // userkeys to binstr
    let binstr = ""
    return new Wallet(binstr, userkeys)
  }
  static async CreateWallet(user,password,code,code_id,chainId){
    let total_obj = {}
    // 创建钱包对象
    let wallet_obj = createWalletObject(password)
    total_obj.wallet = [wallet_obj]
    // 创建私钥用于创建用户
    let private_keys = walletKeys(wallet_obj,password)
    total_obj.private_keys = private_keys
    // 注册账户
    let pubs = private_keys.map(i=>i.pubkey)
    let s = await register(user,pubs,code_id,code)
    let linked_accounts
    if (s.account){
      linked_accounts = [{
        "name": user,
        chainId:chainId
      }]
    }
    total_obj.linked_accounts = linked_accounts
    return new Wallet(total_obj)
  }
  static async FromBin(binBuffer, password) {
    let total_obj = await decryptWalletBackup( PrivateKey.fromSeed(password).toWif(),binBuffer)
    return new Wallet(total_obj)
  }
  static FromPrikey(wif,password){
    let total_obj = {}
    // 创建钱包对象
    let wallet_obj = createWalletObject(password)
    total_obj.wallet = [wallet_obj]
    // add wif
    let key
    try {
      key = wifToKeys(total_obj.wallet[0],password,wif,0)
   }catch(e){
     throw new Error(err_pre+ "UF.wallet.restore.failed")
   }
   total_obj.private_keys = [key]
    return new Wallet(total_obj)
  }
  static FromBrainKey(brainKey, newpassword) {
    let total_obj = {}
    try {
          // 创建钱包对象
    let wallet_obj = createWalletObject(newpassword,brainKey)
    total_obj.wallet = [wallet_obj]
    // 循环寻找pubkey
    let private_keys = walletKeys(wallet_obj,newpassword)
    total_obj.private_keys = private_keys
    // 获取pubkey对应账户
    let linked_accounts
    // 账户id 到 账户名
    total_obj.linked_accounts = linked_accounts
    return new Wallet(total_obj)
    }catch(e){
      console.error(e)
      throw new Error(err_pre+ "UF.wallet.restore.failed")
    }
  }
}

async function main(){
  let w = await Wallet.FromBrainKey("classed amt rani mon phrasy regreen sowse snite retooth amniote blouse shure borzoi sinnen rohun sjambok","yangyulocal")
  console.log(w.get_total_object())
}
// main()
export default Wallet
// s = Wallet.FromBin()
// console.log(genPri(genPassword()),genPri(genPassword()))
