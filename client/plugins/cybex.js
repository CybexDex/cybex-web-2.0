import Vue from 'vue'
import { setStore, g } from '../lib/cybex_help'
import { indexOf } from 'lodash';
import pair from "~/lib/pair_config.js";

/**
 * 分析错误具体构成
 * @param {String} message ex2dev.UB.code.register  
 * @return {Object} 
 * {
 *   server: boolean, // 是否是服务器错误
 *   user: boolean,   // 是否是用户行为错误
 *   unknown: boolean,   // 是否是未知错误
 *   group: string,   // 错误分组
 *   reason: string,  // 错误原因
 *   action: string   // 导致错误的操作
 *   msg: string      // 原始错误信息
 * } 
 */
export function mapErrorMessage(message) {
  if (!message) {
    message = '';
  }
  // 前缀, 分组, 原因, 具体触发
  const [_, group, reason, action] = message.split('.');
  const errorCodeCollection = ['S', 'UB', 'UF']
  const isServerError = group === 'S';
  const isUserError = group === 'UB' || group === 'UF';
  const isUnknowError = indexOf(errorCodeCollection, group) === -1;
  return {
    server: isServerError,
    user: isUserError,
    unknown: isUnknowError,
    reason: reason,
    action: action,
    msg: message
  }
}

function dealServerError(err, app) {
  Vue.prototype.$message({
    message: app.i18n.t('error.connect_error'),
    type: 'error'
  })
}
function dealUserError(err, app, route) {
  const err_key = err.msg.split('.').slice(1).join('_');
  // 如果不存在用户, 强制退出
  if (err_key == 'UB_nouser_get_user_fixed') {
    const redirect = app.i18n.jumpTo('/?from=' + route.path);
    const showLogoutDialog = false;
    app.store.dispatch('auth/logout', {redirect, showLogoutDialog});
    console.log('no user found, logout');
  } else {
    Vue.prototype.$message({
      message: app.i18n.t(`error.${err.msg.split('.').slice(1).join('_')}`),
      type: 'error'
    })
  }
}
function dealUnknownError(err, app) {
  console.error(err);
}
/**
 * 默认处理Cybex抛出的异常
 * 分为服务器错误，用户错误，与未定义错误
 * @see dealServerError() dealUserError() dealUnknownError()
 * @param {*} error 接收到的异常信息
 * @param {*} app app
 */
export async function handleError(error, app, funcName, route, inSilence) {
  const err = mapErrorMessage(error.message);
  if (!inSilence) {
    if (err.server) {
      dealServerError(err, app);
    } else if (err.user) {
      dealUserError(err, app, route);
    } else {
      dealUnknownError(err, app);
    }
  }
  if (!funcName) {
    funcName = 'Unknown Function';
  }
  await g.report(error, funcName)
  // throw error;
}

export default async ({ store, app, route }) => {
  setStore(store);
  // init pairs
  try {
    const pairs = await g.app_pairs();
    store.commit('user/SET_PAIRS', pairs);
  } catch (e) {
    console.error('failed to load pair config from server', e);
    store.commit('user/SET_PAIRS', pair);
  }
  // setup global lib 
  Vue.prototype.cybexjs = g;
  
  Vue.prototype.$callmsg = async function (...args) {
    let returnVal = null
    const callback = args.shift()
    try {
      returnVal = await callback.apply(g, args)
    } catch (error) {
      handleError(error, app, callback.name, route)
      console.error(error)
    }
    return returnVal
  }
  /**
   * 事件处理封装函数
   * @param {*} callback Function 执行方法
   * @param {*} args Array 方法的执行参数
   * @param {*} options Object
   *  {
   *    useDefaultReject: boolean // 是否需要执行默认处理
   *    user: boolean // 是否执行用户报错
   *    server: boolean // 是否执行服务器报错
   *    unknown: boolean // 是否执行未知报错
   *  }
   * @return Promise
   */
  Vue.prototype.$eventHandle = async function (callback, args, options = { useDefaultReject: false, server: false, user: true, unknown: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        let res
        if (args) {
          res = await callback.call(this, ...args);
        } else {
          res = await callback();
        }
        resolve(res);
      } catch (err) {
        const e = mapErrorMessage(err.message);
        const condition =
          (e.server && options.server)
          || (e.user && options.user)
          || (e.unknown && options.unknown)
          || (options.useDefaultReject);
        if (condition) {
          handleError(err, app, callback.name, route)
        } else {
          // 用户自行处理报错
          await g.report(err, callback.name)
        }
        reject(e);
        // console.error(err);
      }
    })
  }

  Vue.prototype.$call = async function (...args) {
    let returnVal = null
    const callback = args.shift()
    try {
      returnVal = await callback.apply(g, args)
    } catch (error) {
      handleError(error, app, callback.name, null, true)
      console.error(error)
      throw error
    }
    return returnVal
  }
  // 初始化用户信息
  // 本地钱包
  await store.dispatch('auth/restore');
  
  Vue.prototype.$message = ({ type, message, delay }) => {
    store.commit('SHOW_MSG', { type, message, delay })
  }
  Vue.prototype.$toggleLock = () => {
    store.commit('TOGGLE_UNLOCK')
  }

  Vue.prototype.$toggleLogout = () => {
    store.commit('TOGGLE_LOGOUT')
  }

  Vue.prototype.$toggleVersion = () => {
    store.commit('TOGGLE_VERSION')
  }
}
