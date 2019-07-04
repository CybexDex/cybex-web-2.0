export const state = () => ({
  showMsg: false,
  msgContent: "",
  msgType: "",
  msgDelay: 3000,
  showUnlock: false,
  showLogout: false,
  showVersion: false,
  dwCoinType: null,
  navMenus: {"internal": {}, "external": {}} // 导航栏设置
});

export const getters = {
  showMsg: state => state.showMsg,
  msgContent: state => state.msgContent,
  msgType: state => state.msgType,
  showUnlock: state => state.showUnlock,
  showLogout: state => state.showLogout,
  showVersion: state => state.showVersion,
  msgDelay: state => state.msgDelay,
  dwCoinType: state => state.dwCoinType,
  navMenus: state => state.navMenus
};

export const mutations = {
  SHOW_MSG: function(state, { type, message, delay }) {
    state.showMsg = true;
    state.msgContent = message;
    state.msgType = type;
    state.msgDelay = delay || state.msgDelay;
  },
  CLOSE_MSG: function(state) {
    state.showMsg = false;
  },
  TOGGLE_UNLOCK: function(state) {
    state.showUnlock = !state.showUnlock;
  },
  TOGGLE_LOGOUT: function(state, val) {
    if (val !== undefined && val !== null) {
      state.showLogout = val;
    } else {
      state.showLogout = !state.showLogout;
    }
  },
  TOGGLE_VERSION: function(state) {
    state.showVersion = !state.showVersion;
  },
  UPDATE_DW_COINTYPE: function(state, cointype) {
    state.dwCoinType = cointype;
  },
  SET_NAV_MENUS: (state, menus) => {
    state.navMenus = Object.assign(state.navMenus, menus);
  }
};

export const actions = {
};
