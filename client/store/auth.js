import Wallet from "~/lib/wallet";
import { UserService, LOGIN_MODE_LOCAL, LOGIN_MODE_CLOUD } from "~/lib/user";
import UserStorageService from "~/lib/storage";
import { saveAs } from "file-saver";
import moment from "moment";
import { get } from "lodash";

const errorPrefix = "ex2wallet.";
// auth.js
// 用户身份验证 解锁等相关逻辑
export const state = () => ({
  info: null, // 用户全信息
  username: null, // 当前用户,
  userId: null, // 当前用户id
  islocked: null, // 是否被锁状态,
  isCloud: null, // 是否是云钱包,
  hasNotice: false, // 是否有新通知
  wallet: null,
  LOGIN_MODE_LOCAL: LOGIN_MODE_LOCAL, // 常量 本地钱包模式
  LOGIN_MODE_CLOUD: LOGIN_MODE_CLOUD // 常量 云钱包模式
});

export const getters = {
  info: state => state.info,
  username: state => (state.info ? state.info.getCurrentUser() : null),
  userId: state => state.userId,
  islocked: state => (state.info ? state.info.getIsLocked() : null),
  isCloud: state => (state.info ? state.info.getIsCloudLogin() : null),
  wallet: state => (state.info ? state.info.getWallet() : null),
  hasNotice: state => state.hasNotice,
  LOGIN_MODE_LOCAL: state => state.LOGIN_MODE_LOCAL,
  LOGIN_MODE_CLOUD: state => state.LOGIN_MODE_CLOUD
};

export const mutations = {
  initAuthInfo(state, { users, mode, keys, wallet }) {
    const user = new UserService(users, mode, keys, wallet);
    state.info = user;
    if (users.length) {
      // 用于报告调试用bug
      console.log("sentry_user");
      this._vm.cybexjs.sentry_user(users[0]);
    }
  },
  clearAuthInfo(state) {
    state.info = null;
    state.hasNotice = false;
    state.userId = null;
  },
  lock(state) {
    if (state.info) {
      state.info.lockWallet();
    }
  },
  unlock(state, keys) {
    if (state.info) {
      state.info.unlockWallet(keys);
    }
  },
  switchUser(state, user) { 
    if (state.info) {
      state.info.switchCurrenUser(user);
    }
  },
  addUserKey(state, { password, key }) {
    if (state.info) {
      state.info.wallet.addWifKey(password, key);
    }
  },
  async updateWalletUsers(state, { users, wallet }) {
    if (state.info) {
      state.info.setUsers(users);
      state.info.setWallet(new Wallet(wallet));
    }
    state.hasNotice = true;
  },
  async setNotice(state, val) {
    state.hasNotice = val;
    if (state.info && !state.isCloud && !val) {
      const storage = new UserStorageService();
      await storage.cleanBackupNotice(state.info.wallet);
    }
  },
  setUserId(state, id) {
    state.userId = id;
  }
};

export const actions = {
  // 根据浏览器缓存初始化用户相关数据
  async restore({ commit }) {
    let storage = new UserStorageService();
    let u = storage.getCloudWalletName();
    // 优先恢复云钱包
    if (u) {
      commit("initAuthInfo", {
        users: [{ name: u }],
        mode: LOGIN_MODE_CLOUD,
        keys: null,
        wallet: null
      });
      commit("setNotice", false);
      // 检查是否有本地钱包
    } else if ((u = storage.getLocalWalletName())) {
      const wallet = await storage.loadWallet();
      if (wallet) {
        // 解析用户名
        const users = await storage.getWalletUserList(this._vm.cybexjs);
        if (wallet) {
          let needBackup = get(wallet, ["need_backup", "value"], true);
          commit("setNotice", needBackup);
        }
        commit("initAuthInfo", {
          users: users,
          mode: LOGIN_MODE_LOCAL,
          keys: null,
          wallet: new Wallet(wallet)
        });
      } else {
        // 有钱包名缓存但是无相关数据库
        // 清除缓存
        storage.deleteWallet(LOGIN_MODE_LOCAL);
      }
    }
  },
  // 用户登录 分本地钱包和云钱包模式
  // 对cybex用户 login = unlock + 设置本地缓存
  login(
    { commit, state, rootState },
    { username, password, mode, walletFile, backupFlag = false }
  ) {
    return this._vm.$eventHandle(
      async () => {
        let loginIsSuccess;
        let storage = new UserStorageService();
        // 云钱包初始化
        if (mode == LOGIN_MODE_CLOUD) {
          const result = await this._vm.cybexjs.unlock(
            username,
            password,
            UserStorageService.getUnlockPeriod(username)
          );
          loginIsSuccess = result && result.code === 0;
          if (loginIsSuccess) {
            storage.saveCloudWallet(username);
            commit("initAuthInfo", {
              users: [{ name: username }],
              mode: mode,
              keys: result.userkeys,
              wallet: null
            });
          }
        } else {
          // 本地钱包根据文件初始化
          let wallet;
          if (walletFile instanceof Buffer) {
            wallet = await Wallet.FromBin(walletFile, password);
          } else if (walletFile instanceof Wallet) {
            wallet = walletFile;
          }
          // save wallet as database
          await storage.saveLocalWallet(wallet);
          // unlock wallet
          let userkeys = await wallet.getKeyPairs(password);
          if (userkeys) {
            // check users
            let users = await storage.getWalletUserList(this._vm.cybexjs);
            // await this._vm.cybexjs.chooseUser(users[0].name)
            await this._vm.cybexjs.unlockKeyPairs(
              userkeys,
              users[0].name,
              UserStorageService.getUnlockPeriod(users[0].name)
            );
            loginIsSuccess = true;
            commit("initAuthInfo", {
              users: users,
              mode: mode,
              keys: userkeys,
              wallet: wallet
            });
            let needBackup = get(
              wallet,
              ["total_obj", "need_backup", "value"],
              backupFlag
            );
            commit("setNotice", needBackup);
          }
        }
        return loginIsSuccess;
      },
      [],
      { user: false }
    );
  },
  // 用户登出，清除相关信息
  logout({ commit, state }, { redirect, showLogout }) {
    let storage = new UserStorageService();
    return storage.deleteWallet(state.info.mode).then(res => {
      commit("clearAuthInfo");
      if (showLogout) {
        this._vm.$toggleLogout();
      }
      if (redirect) {
        this.$router.push(redirect);
      }
    });
  },
  // 切换 锁状态
  async toggleLock({ commit, state }, noLoginPage) {
    return await this._vm.$eventHandle(async () => {
      const userService = state.info;
      if (userService && userService.currentUser) {
        if (userService.getIsLocked()) {
          this._vm.$toggleLock(); // 打开 UnlockDialog 输入密码
        } else {
          await this._vm.cybexjs.lock(); // 底层清空数据
          commit("lock");
          // rawlog('lock');
          return true;
        }
      } else {
        this.$router.push(noLoginPage);
      }
    });
  },
  // register
  // 注册
  async register(
    { dispatch, commit },
    { mode, username, password, codeId, code }
  ) {
    console.log(
      "mode, username, password, codeId, code ",
      mode,
      username,
      password,
      codeId,
      code
    );
    return await this._vm.$eventHandle(async () => {
      let result;
      try {
        if (mode == LOGIN_MODE_CLOUD) {
          result = await this._vm.cybexjs.register(
            username,
            password,
            codeId,
            code
          );
          // 注册后登录
          if (result) {
            await dispatch("login", { mode, username, password });
          }
        } else {
          const walletFile = await Wallet.CreateWallet(
            username,
            password,
            code,
            codeId
          );
          if (walletFile) {
            result = true;
            const backupFlag = true;
            await dispatch("login", {
              mode,
              username,
              password,
              walletFile,
              backupFlag
            });
          }
        }
      } catch (e) {
        result = false;
        throw e;
      }
      return result;
    });
  },
  // unlock
  async unlock({ commit, state }, {password, toggleDialog = true}) {
    return await this._vm.$eventHandle(
      async () => {
        const userService = state.info;
        if (userService && userService.currentUser) {
          // unlock cloud
          if (userService.getIsCloudLogin()) {
            const result = await this._vm.cybexjs.unlock(
              userService.currentUser,
              password,
              UserStorageService.getUnlockPeriod(userService.currentUser)
            );
            if (result && result.code === 0) {
              commit("unlock", result.userkeys); // store层数据
              console.log('toggleDialog', toggleDialog);
              if (toggleDialog) {
                this._vm.$toggleLock(); // 关闭解锁弹窗
              }
              return true;
            } else {
              return false; // unknown reason caused failure
            }
          } else {
            // unlock local
            let wallet = userService.wallet;
            if (!wallet) {
              return false;
            }
            let userkeys = await wallet.getKeyPairs(password);
            if (userkeys) {
              // await this._vm.cybexjs.chooseUser(state.info.getCurrentUser())
              // console.log('UserStorageService.getUnlockPeriod(state.info.getCurrentUser())', state.info.getCurrentUser(), UserStorageService.getUnlockPeriod(state.info.getCurrentUser()));
              await this._vm.cybexjs.unlockKeyPairs(
                userkeys,
                state.info.getCurrentUser(),
                UserStorageService.getUnlockPeriod(state.info.getCurrentUser())
              );
              commit("unlock", userkeys); // store层数据
              if (toggleDialog) {
                this._vm.$toggleLock(); // 关闭解锁弹窗
              }
              return true;
            } else {
              return false;
            }
          }
        }
      },
      [],
      { user: false } // 不弹错误框
    );
  },
  // switch user
  async changeCurrentUser({ commit, state, dispatch }, user) {
    if (!state.info) {
      new Error("no user found, try relogin");
    }
    try {
      await this._vm.cybexjs.chooseUser(user.id);
      commit("switchUser", user)
      await dispatch('getUserId');
      return true;
    } catch (e) {
      console.error("error", e);
      return false;
    } 
  },
  // import private key
  async importPrivateKey({ state, commit }, { password, key }) {
    if (state.info) {
      try {
        await commit("addUserKey", { password, key });
        return new Promise(async (resolve, reject) => {
          try {
            // 更新数据库
            const storage = new UserStorageService();
            await storage.updateLocalWallet(state.info.wallet);
            // // 更新用户列表
            const users = await storage.getWalletUserList(this._vm.cybexjs);
            const wallet = await storage.loadWallet();
            commit("updateWalletUsers", { users, wallet });
            resolve(true);
          } catch (e) {
            reject(e);
          }
        });
      } catch (e) {
        throw new Error(e);
      }
    } else {
      throw new Error(errorPrefix + "UF.wallet.import.failed");
    }
  },
  // 下载备份文件
  async downloadBinFile({ commit, state }, { blob, filename }) {
    if (!blob && state.info) {
      const wallet = state.info.prepareDownloadObj(Wallet);
      const s = await wallet.exportBin();
      blob = new Blob([s], {
        type: "application/octet-stream; charset=us-ascii"
      });
    }
    if (!filename) {
      const currentDate = moment().format("YYYYMMDD");
      filename = `Cybex_default_${currentDate}.bin`;
    }
    saveAs(blob, filename);
    commit("setNotice", false);
  },
  // 根据助记词/私钥和新密码创建新钱包
  async resetWallet({ commit, dispatch }, { mode, input, password }) {
    return this._vm.$eventHandle(
      async () => {
        let wallet;
        if (mode == "phrase") {
          wallet = await Wallet.FromBrainKey(input, password);
        } else {
          wallet = await Wallet.FromPrikey(input, password);
        }
        // 根据公钥解析用户名
        const pubs = wallet.total_obj.private_keys.map(i => i.pubkey);
        let s = await this._vm.cybexjs.key_accounts(pubs);
        // 公钥没有找到对应的用户
        // 可能的情况为
        // 1. 助记词: 该助记词为一个通过导入私钥还原的钱包文件所产生的助记词，
        // 此场景，助记词对应的仅为钱包本身，不包含用户
        // 2. 私钥: 在对应链上查找不到对应的用户
        if (!s.length) {
          throw new Error(errorPrefix + "UF.wallet.restore.failed");
        }
        const username = s[0].name;
        if (!wallet.total_obj.linked_accounts) {
          wallet.total_obj.linked_accounts = s;
        }
        const backupFlag = true;
        // console.log("create new wallet", wallet);
        return await dispatch("login", {
          username,
          password,
          mode: LOGIN_MODE_LOCAL,
          walletFile: wallet,
          backupFlag
        });
      },
      [],
      { user: false }
    );
  },
  getUnlockPeriod({}, username) {
    return UserStorageService.getUnlockPeriod(username);
  },
  setUnlockPeriod({}, { username, val }) {
    return UserStorageService.setUnlockPeriod(username, val);
  },
  async getUserId({state, commit}) {
    if (state.info) {
      const userInfo = await this._vm.cybexjs.get_user(state.info.getCurrentUser());
      commit('setUserId', userInfo.account.id);
    }
  }
};
