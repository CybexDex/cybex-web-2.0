/**
 * 浏览器用户存储相关方法
 */
const DBPrefix = "_cybex_";
const DBMainStore = "wallet"; // 主表
const DBKeyPath = "wallet_name"; // 主键
const walletWrapper = "total_obj"; // for 1.0兼容格式

import config from "~/lib/config/config.js";
import { LOGIN_MODE_LOCAL, LOGIN_MODE_CLOUD } from "./user";
export default class UserStorageService {
  // 检查是否存在本地用户或者云钱包用户的缓存名
  _cloudKey;
  _localKey;
  // storage服务
  _storage;
  // indexedDB服务
  _db;

  constructor(cloudKey, localKey) {
    this._cloudKey = cloudKey ? cloudKey : "username";
    this._localKey = localKey ? localKey : "walletname";
    this.setupStorage();
  }

  static getUnlockPeriod(username) {
    if (!username) {
      return null;
    }
    let val;
    let settings = localStorage.getItem(`${username}_settings`);
    if (settings) {
      settings = JSON.parse(settings);
      val = settings.unlockPeriod * 60;
    } else {
      val = config.unlockPeriod;
    }
    return val;
  }
  static setUnlockPeriod(username, val) {
    if (!username) {
      return;
    }
    let settings = localStorage.getItem(`${username}_settings`);
    if (!settings) {
      settings = { unlockPeriod: val };
    } else {
      settings = JSON.parse(settings);
      settings = Object.assign(settings, { unlockPeriod: val });
    }
    localStorage.setItem(`${username}_settings`, JSON.stringify(settings));
  }
  // todo change _storage to Service
  setupStorage(type = "local") {
    if (type == "local") {
      this._storage =
        window && window.localStorage
          ? window.localStorage
          : window.sessionStorage;
    }
  }
  setupDatabase(dbname, type = "indexedDB") {
    if (!dbname) return false;
    if (type === "indexedDB") {
      if (!window.indexedDB) {
        new Error(
          "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
        );
      }
      this._db = new iDBService(dbname);
    }
  }
  // 设置云钱包账户名
  setCloudWalletName(walletName) {
    this._storage.setItem(this._cloudKey, walletName);
  }
  getCloudWalletName() {
    return this._storage.getItem(this._cloudKey);
  }
  // 获取本地钱包账户名
  getLocalWalletName() {
    return this._storage.getItem(this._localKey);
  }
  // 设置本地钱包账户名
  setLocalWalletName(walletName) {
    this._storage.setItem(this._localKey, walletName);
  }

  // 云钱包
  async saveCloudWallet(walletName) {
    this.setCloudWalletName(walletName);
  }

  /**
   * 保存钱包进indexedDB和本地对应账户名
   * @param {Wallet} wallet  @see wallet.js
   * @return Promise
   */
  async saveLocalWallet(wallet) {
    wallet = wallet[walletWrapper] ? wallet[walletWrapper] : wallet;
    if (!wallet) {
      throw new Error("no wallet!");
    }
    let walletName = DBPrefix + wallet.linked_accounts[0].name;
    if (!this._db) {
      this.setupDatabase(walletName);
    }
    // 设置indexedDB主键
    wallet[DBKeyPath] = walletName;
    return this._db.putField(wallet).then(res => {
      // 设置还原用本地缓存
      this.setLocalWalletName(walletName);
      return res;
    });
  }
  // 更新钱包字段
  async updateLocalWallet(newWallet) {
    newWallet = newWallet[walletWrapper] ? newWallet[walletWrapper] : wallet;
    return this.loadWallet().then(async oldWallet => {
      // let newWallet = Object.assign({}, oldWallet);
      newWallet["need_backup"] = { value: true };
      this._db.putField(newWallet).then(res => {
        // 设置还原用本地缓存
        // rawlog("new wallet updated", newWallet);
        return res;
      });
    });
  }
  async cleanBackupNotice() {
    return this.loadWallet().then(async wallet => {
      // let newWallet = Object.assign({}, oldWallet);
      if (wallet) {
        wallet["need_backup"] = { value: false };
        this._db.putField(wallet).then(res => {
          // 设置还原用本地缓存
          return res;
        });
      }
    });
  }
  // 还原钱包对象
  async loadWallet() {
    if (!this._db && this.getLocalWalletName()) {
      this.setupDatabase(this.getLocalWalletName());
    } else if (!this.getLocalWalletName()) {
      return false;
    }
    return this._db
      .readField(this.getLocalWalletName(), null)
      .then(async res => {
        if (res) {
          return res;
        } else {
          // TODO 读取失败
        }
      });
  }
  // 获取钱包中所有用户
  async getWalletUserList(loader) {
    return this.loadWallet().then(async wallet => {
      let pubs = wallet.private_keys.map(i => i.pubkey);
      let s = await loader.key_accounts(pubs);
      return s;
    });
  }
  // 删除数据库
  deleteWallet(mode) {
    return new Promise((resolve, reject) => {
      try {
        if (mode == LOGIN_MODE_LOCAL) {
          if (!this._db && this.getLocalWalletName()) {
            this.setupDatabase(this.getLocalWalletName());
          } else if (!this.getLocalWalletName()) {
            reject("no local wallet found");
          }
          this._db.deleteDatabase().then(res => {
            this._storage.removeItem(this._localKey);
          });
        } else if (mode == LOGIN_MODE_CLOUD) {
          this._storage.removeItem(this._cloudKey);
        }
        resolve(true);
      } catch (e) {
        reject("failed");
      }
    });
  }
}

// indexedDB
class iDBService {
  _db;
  _db_name;
  constructor(name) {
    this._db_name = name;
  }

  open() {
    if (this._db) {
      return new Promise(resolve(this._db));
    }
    return new Promise((resolve, reject) => {
      if (!this._db_name) {
        reject(new Error("no db name found"));
      }
      if (!this._db) {
        let request = window.indexedDB.open(this._db_name);
        request.onerror = function(event) {
          reject("Database error: " + event.target.errorCode);
        };
        request.onsuccess = function(event) {
          this._db = event.target.result;
          resolve(this._db);
        };
        request.onupgradeneeded = function(event) {
          this._db = event.target.result;
          this._db.createObjectStore(DBMainStore, { keyPath: DBKeyPath });
        };
      }
    });
  }
  close() {
    this._db.close();
    this._db = null;
  }
  async deleteDatabase() {
    return new Promise((resolve, reject) => {
      console.log("delete?", this._db_name);
      if (!this._db_name) {
        return;
      }

      let request = window.indexedDB.deleteDatabase(this._db_name);
      request.onerror = function(event) {
        reject("Error deleting database.");
      };
      request.onsuccess = function(event) {
        console.log("Database deleted successfully");
        resolve(event.result);
      };
    });
  }
  async readField(fieldValue, defaultValue, storeName = DBMainStore) {
    return this.open()
      .then(db => {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        let p = request => {
          return new Promise((resolve, reject) => {
            request.onsuccess = e => {
              resolve(e.target.result ? e.target.result : defaultValue);
            };
            request.onerror = e => {
              reject(e);
            };
          });
        };
        return p(store.get(fieldValue));
      })
      .catch(error => {
        console.error(error);
        throw error;
      });
  }
  async putField(fieldData, storeName = DBMainStore) {
    return this.open()
      .then(db => {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        return store.put(fieldData);
      })
      .catch(error => {
        console.error(error);
        throw error;
      });
  }
}
