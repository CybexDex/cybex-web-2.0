// 云钱包 - 默认localStorage保存用户名
// 本地钱包 - 默认indexedDB保存钱包数据库，localStorage保存钱包数据库名

// import config from "~/lib/config/config.js";
export const anonymousUser = "anonymous";
export const LOGIN_MODE_LOCAL = "local";
export const LOGIN_MODE_CLOUD = "cloud";

/**
 * 钱包对象字段
 */
const walletFields = [
  "linked_accounts", // 钱包中的用户
  "wallet", // 钱包主题字段
  "private_keys" // 私钥
];
export class UserService {
  currentUser; // 当前激活用户名
  users; // 用户列表 Array< {id: String, name: String, full: Boolean}
  _keys; // 判定是否解锁用的关键字
  keyExpiredTimer; // 定时器 检查上锁与否
  assets = []; // TODO 所拥有资产
  mode; // 登录模式，默认云钱包
  wallet; // 钱包格式
  // unlockPeriod = config.unlockPeriod;

  // 构造函数
  constructor(users = [], mode = LOGIN_MODE_CLOUD, keys = null, wallet = null) {
    this.setUsers(users);
    this.currentUser = users.length ? users[0].name : null;
    this.mode = mode;
    this.checkLockByKeys(keys);
    this.setWallet(wallet);
  }
  /** setter */
  setUsers(users) {
    this.users = users;
  }
  setWallet(wallet) {
    this.wallet = wallet;
  }
  /** getter **/
  getCurrentUser() {
    return this.currentUser;
  }
  getDefaultUser() {
    return this.users[0].name;
  }
  // 资产列表
  getAssets() {
    return this.assets;
  }
  getWallet() {
    return this.wallet;
  }
  // 是否云钱包登录
  getIsCloudLogin() {
    return this.mode == LOGIN_MODE_CLOUD;
  }
  // 时间锁 定时器相关
  // @see cybex-help.js
  // 设置定时器超时
  // setLockTimer() {
  //   if (this.unlockPeriod && !this.keyExpiredTimer) {
  //     this.keyExpiredTimer = setTimeout(() => {
  //       this.lockWallet();
  //     }, this.unlockPeriod * 1000);
  //   }
  // }
  // // 清除定时器
  // clearLockTimer() {
  //   if (this.keyExpiredTimer) {
  //     clearTimeout(this.keyExpiredTimer);
  //     this.keyExpiredTimer = null;
  //   }
  // }
  // refreshLockTimer() {
  //   if (this.keyExpiredTimer) {
  //     this.clearLockTimer();
  //   }
  //   this.setLockTimer();
  // }


  // 根据传入的keys判定是解锁还是上锁钱包
  checkLockByKeys(keys) {
    if (keys) {
      this.unlockWallet(keys);
    } else {
      this.lockWallet();
    }
  }
  lockWallet() {
    this._keys = null;
    // this.clearLockTimer();
  }
  unlockWallet(keys) {
    this._keys = keys;
    // check locker
    // if (!this.keyExpiredTimer) {
    //   this.setLockTimer();
    // }
  }
  // 是否用户密码锁已锁
  getIsLocked() {
    return !(this._keys && this._keys.length > 0);
  }
  /**
   * 切换当前钱包用户
   * @param {*} user
   */
  switchCurrenUser(user) {
    let check;
    // 验证user是否属于这个钱包
    if (user && user.id) {
      check = this.users.filter(u => u.id == user.id);
    }
    if (!check) {
      return false;
    } else {
      this.currentUser = user.name;
    }
    return true;
  }
  addPrivateKey(key, password) {
    if (this.wallet) {
      this.wallet.addWifKey(password, key);
    }
  }
  // 兼容1.0格式  去除不必要的字段
  prepareDownloadObj(Wallet) {
    if (!this.wallet) {
      throw new Error("UF.wallet.not_exist");
    }
    const exportWallet = Object.assign(new Wallet(), this.wallet);
    for (const key in exportWallet["total_obj"]) {
      if (walletFields.indexOf(key) == -1) {
        delete exportWallet["total_obj"][key];
      }
    }
    return exportWallet;
  }
}
