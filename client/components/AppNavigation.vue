<template>
  <v-toolbar
    class="cybex-nav pa-0"
    :class="{'small-size': height < 60}"
    :clipped-left="clipped"
    :height="height"
    fixed
    app
  >
    <div
      class="user-notice-fixed"
      :class="{'not-show': !userHasNotice}"
      :style="`top: ${(height + 5)}px`"
      @click="$router.push($i18n.path('/settings/backup'))"
    >
      <v-icon size="16" class="mr-1">ic-error</v-icon>
      {{ 'Backup' }}
    </div>
    <v-snackbar
      :class="`msg-${ msgType || 'normal' }`"
      v-model="isShowMsg"
      :timeout="msgDelay"
      top
      absolute
    >
      <div class="content">
        <span
          class="icon"
          :class="{'ic-correct': msgType != 'error', 'ic-cancel': msgType == 'error'}"
        />
        <span class="msg">{{ message }}</span>
      </div>
    </v-snackbar>
    <perfect-scrollbar>
      <div class="logo-banner">
        <router-link :to="$i18n.path('/')">
          <img src="~assets/svg/cybex-logo.svg" alt="Cybex Dashboard" data-radium="true">
        </router-link>
      </div>
      <div class="divider"/>
      <div d-flex class="volume24h">
        <div class="label">{{ $t('nav.volume24h') }}</div>
        <div class="volume">
          {{ volume24h && !is_contest && !asset_is_custom? volume24h : '--' }} &nbsp;
          <asset-pairs :asset-id="volumeCoin"/>
        </div>
      </div>
      <div class="exchange-tab" :class="{'fill-height': $route.path.indexOf('/exchange') > -1}">
        <nuxt-link
          :to="$i18n.path(defaultExchangePath)"
          :class="getLinkClass('/exchange')"
        >{{ $t('nav.exchange') }}</nuxt-link>
      </div>
      <!-- 读取配置生成对应菜单 -->
      <div v-for="(menu, menuIdx) of navMenus.internal" :key="menuIdx" class="fill-height d-flex align-center">
        <div v-if="menu.enable" class="exchange-tab" :class="{'fill-height': $route.path.indexOf(menu.url) > -1}">
          <nuxt-link
            :to="$i18n.path(menu.url)"
            :class="getLinkClass(menu.url)"
          >{{ locale == 'en' ? menu.text['en'] : menu.text['zh-cn'] }}</nuxt-link>
        </div>
      </div>
      <v-menu
        v-if="navMenus.external && navMenus.external.enable"
        content-class="nav-menu"
        class="ml-3 pl-0 exchange-tab nav-menu-wrapper column activity"
        :transition="'fade-transition'"
        offset-y
        auto
        open-on-hover
      >
        <div slot="activator" class="full-width btn-jump" dark>
          {{ locale == 'en' ? navMenus.external.text['en'] : navMenus.external.text['zh-cn'] }}
        </div>
        <v-list class="asset-menu">
          <v-list-tile v-for="(submenu, subIdx) of navMenus.external.items" :key="subIdx" :class="{hidden: !submenu.enable}">
            <v-list-tile-title v-if="submenu.enable">
              <a target="_blank" :href="submenu.url">
                {{ locale == 'en' ? submenu.text['en'] : submenu.text['zh-cn'] }}
              </a>
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-spacer/>
      <!-- funds menu -->
      <v-menu
        v-if="username"
        content-class="nav-menu"
        class="pl-0 ml-5 nav-menu-wrapper column"
        :transition="'fade-transition'"
        offset-y
        auto
        open-on-hover
      >
        <div
          slot="activator"
          class="full-width"
          :class="getLinkClass('/fund')"
          dark
        >{{ $t('nav.funds') }}</div>
        <v-list class="asset-menu">
          <v-list-tile
            v-for="(item, index) in funditems"
            :key="index"
            @click="$i18n.jumpTo(item.path)"
            :class="getLinkClass(item.path)"
          >
            <v-list-tile-title>{{ $t(item.title) }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <nuxt-link v-else :class="getLinkClass('/')" :to="toLoginPath">{{ $t('nav.login') }}</nuxt-link>
      <!-- order menu -->
      <v-menu
        v-if="username"
        class="nav-menu-wrapper column"
        content-class="nav-menu"
        offset-y
        auto
        open-on-hover
        :transition="'fade-transition'"
      >
        <div
          slot="activator"
          class="full-width"
          :class="getLinkClass('/orders')"
          dark
        >{{ $t('nav.orders') }}</div>
        <v-list class="asset-menu">
          <v-list-tile
            v-for="(item, index) in orderitems"
            :key="index"
            :class="getLinkClass(item.path)"
            @click="$i18n.jumpTo(item.path)"
          >
            <v-list-tile-title>{{ $t(item.title) }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <template v-else>
        <nuxt-link
          :class="getLinkClass('/register')"
          :to="$i18n.path('/register')"
        >{{ $t('nav.register') }}</nuxt-link>
      </template>
      <div v-if="username" class="portrait-link">
        <div v-if="switchUserList.length < 1" class="toggle-user-wrapper">
          <!-- 头像  -->
          <UserPortrait :username="username" size="64"/>
          <!-- 用户名 -->
          <div class="pl-3 overflow-username" :title="username">{{ username }}</div>
        </div>
        <!-- 可切换用户名 -->
        <v-menu
          v-else
          class="nav-menu-wrapper user"
          content-class="pl-0 nav-menu"
          offset-y
          auto
          bottom
          center
          :transition="'fade-transition'"
        >
          <div slot="activator" class="toggle-user-wrapper">
            <!-- 头像  -->
            <UserPortrait :username="username" size="64"/>
            <!-- 用户名 -->
            <div class="pl-3 overflow-username cursor-pointer" :title="username">{{ username }}</div>
          </div>
          <v-list class="asset-menu">
            <v-list-tile
              v-for="(user, index) in switchUserList"
              :key="index"
              @click="changeCurrentUser(user)"
            >
              <UserPortrait class="ml-2" :username="user.name" size="32"/>
              <span
                class="pl-2 overflow-username keep-inline cursor-pointer"
                :title="user.name"
              >{{ user.name }}</span>
            </v-list-tile>
          </v-list>
        </v-menu>
      </div>

      <v-flex class="nav-icons" v-if="username">
        <!-- 解锁 -->
        <div class="link-btn text-center">
          <v-btn icon @click="onUnlockClicked">
            <v-icon v-html="islocked ? 'ic-lock_tab' : 'ic-unlock_tab'"/>
          </v-btn>
          <unlock-dialog/>
        </div>
        <!-- 设置 -->
        <v-menu
          class="nav-menu-wrapper icon column"
          content-class="pl-0 nav-menu icon"
          offset-y
          auto
          bottom
          center
          :transition="'fade-transition'"
        >
          <div class="link-btn text-center settings" slot="activator">
            <v-btn icon>
              <v-icon>ic-settings</v-icon>
            </v-btn>
            <logout-dialog/>
          </div>
          <v-list class="asset-menu">
            <template v-for="(item, index) in settingItems">
              <!-- 菜单跳转 -->
              <v-list-tile
                v-if="item.path"
                :key="index"
                :class="getLinkClass(item.path)"
                @click="$i18n.jumpTo(item.path)"
              >
                <v-list-tile-title>{{ $t(item.title) }}</v-list-tile-title>
              </v-list-tile>
              <!-- 弹窗事件 -->
              <v-list-tile :key="index" v-else @click="item.clickEvt">
                <v-list-tile-title>{{ $t(item.title) }}</v-list-tile-title>
                <SettingsDialog v-model="isShowSettingDialog"/>
                <PermissionDialog v-model="isShowPermissionDialog"/>
              </v-list-tile>
            </template>
          </v-list>
        </v-menu>
        <!-- 登出 -->
        <div class="link-btn text-center">
          <v-btn icon @click="onLogoutClick">
            <v-icon>ic-logout</v-icon>
          </v-btn>
          <logout-dialog/>
        </div>
      </v-flex>

      <!-- 语言选择 -->
      <v-menu
        class="lang-select nav-menu-wrapper column"
        :class="{'border-left': !username}"
        :value="openLanMenu"
        offset-y
        auto
        content-class="nav-menu"
        open-on-hover
        close-on-click
        :nudge-bottom="12"
        :transition="'fade-transition'"
        @click.native="(openLanMenu = !openLanMenu)"
      >
        <v-flex d-flex align-center slot="activator">
          {{ $i18n.label() }}
          <span v-if="openLanMenu" class="ic-arrow_up"/>
          <span v-else class="ic-arrow_drop_down"/>
        </v-flex>
        <v-list>
          <v-list-tile v-for="(lang, index) in langs" :key="index" @click="switchLang(lang.code)">
            <v-list-tile-title>
              <span class="lang-item">{{ lang.title }}</span>
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </perfect-scrollbar>
  </v-toolbar>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import utils from "~/components/mixins/utils";
import jdenticon from "jdenticon";
import sha256 from "sha256";

export default {
  name: "AppNavgation",
  mixins: [utils],
  components: {
    UnlockDialog: () => import("~/components/UnlockDialog.vue"),
    LogoutDialog: () => import("~/components/LogoutDialog.vue"),
    UserPortrait: () => import("~/components/UserPortrait.vue"),
    SettingsDialog: () => import("~/components/AppSettingsDialog.vue"),
    PermissionDialog: () => import("~/components/AppPermissionDialog.vue")
  },
  props: {
    height: {
      type: Number,
      default: 60
    }
  },
  data() {
    return {
      defaultCoin: "ETH",
      openLanMenu: false,
      intervalVolume: null,
      clipped: true,
      title: this.$t("title.name"),
      orderitems: [
        {
          title: "nav.open_order",
          path: "/orders/open-order"
        },
        {
          title: "nav.order_history",
          path: `/orders/order-history`
        },
        {
          title: "nav.trade_history",
          path: `/orders/trade-history`
        }
      ],
      settingItems: [],
      isShowSettingDialog: false,
      needShowPerm: false,
      isShowPermissionDialog: false
    };
  },
  watch: {
    authInfo(val) {
      this.settingItems = this.getSettingItems();
    },
    islocked(val) {
      if (!val && this.needShowPerm) {
        this.isShowPermissionDialog = true;
        this.needShowPerm = false;
      }
      console.log("islocked changed", val);
    }
  },
  computed: {
    ...mapGetters({
      navMenus: "navMenus",
      inited: "user/inited",
      connect: "exchange/connect",
      prefix: "exchange/prefix",
      authInfo: "auth/info",
      username: "auth/username",
      isCloud: "auth/isCloud",
      islocked: "auth/islocked",
      userHasNotice: "auth/hasNotice",
      asset_is_custom: "exchange/asset_is_custom",
      is_contest: "exchange/is_contest",
      showMsg: "showMsg",
      message: "msgContent",
      msgType: "msgType",
      langs: "i18n/locales",
      locale: "i18n/locale",
      msgDelay: "msgDelay",
      defaultAsset: "exchange/defaultAsset",
      volume24h: "exchange/volume24h",
      coinMap: "user/coins"
    }),
    // 切换用用户下拉列表
    switchUserList() {
      if (this.authInfo && this.authInfo.users.length > 1) {
        return this.authInfo.users.filter(item => item.name !== this.username);
      }
      return [];
    },
    defaultExchangePath() {
      return this.$route.params.currency
        ? `/exchange/${this.$route.params.currency}`
        : "/exchange";
    },
    defaultContestPath() {
      return this.$route.params.pairs
        ? `/contest/${this.$route.params.pairs}`
        : "/contest";
    },
    volumeCoin() {
      return this.prefix + this.defaultCoin;
    },
    toLoginPath: function() {
      const isLoginPage =
        this.$route.matched.length == 1 &&
        this.$route.matched[0].path === "/:lang";
      return !isLoginPage
        ? this.$i18n.path("/" + "?from=" + this.$route.path)
        : this.$i18n.path("/");
    },
    isShowMsg: {
      get() {
        return this.showMsg;
      },
      set(value) {
        this.$store.commit("CLOSE_MSG");
      }
    },
    cointype() {
      return this.$route.params.cointype || this.defaultAsset;
    },
    funditems() {
      return [
        {
          title: "nav.assets",
          path: "/fund/assets"
        },
        {
          title: "nav.deposit",
          path: `/fund/deposit/${this.cointype}`
        },
        {
          title: "nav.withdraw",
          path: `/fund/withdraw/${this.cointype}`
        },
        {
          title: "nav.transfer_history",
          path: "/fund/history"
        },
        {
          title: "nav.rebates",
          path: "/rebates"
        }
      ];
    }
  },
  methods: {
    getSettingItems() {
      if (!this.username) {
        return [];
      }
      let items = [
        {
          title: "nav.settings.general",
          path: "",
          clickEvt: this.showSettingDialog
        }
        // {
        //   title: "nav.settings.restore",
        //   path: `/settings/restore`
        // }
      ];
      if (!this.isCloud) {
        items.push({
          title: "nav.settings.import",
          path: `/settings/import`
        });
        items.push({
          title: "nav.settings.backup",
          path: `/settings/backup`
        });
      }
      items.push({
        title: "nav.settings.permission",
        path: "",
        clickEvt: this.showPermissionDialog
      });
      return items;
    },
    showSettingDialog() {
      this.isShowSettingDialog = true;
    },
    async showPermissionDialog() {
      this.isShowPermissionDialog = true;
    },
    async changeCurrentUser(user) {
      let result = await this.$store.dispatch("auth/changeCurrentUser", user);
      console.log("result", result);
      if (result) {
        this.$message({
          message: this.$t("message.user_changed", { user: user.name }),
          type: "success"
        });
      } else {
        this.$message({
          message: "error",
          type: "error"
        });
      }
    },
    // 当前页路由入口高亮
    getLinkClass(path) {
      let isActive = this.$route.path.indexOf(path) > -1;
      if (path === "/") {
        isActive = this.$route.path.endsWith(`/${this.$route.params.lang}/`);
      }
      if (path === "/fund") {
        for (const subpath of ["deposit", "withdraw", "assets", "history"]) {
          isActive = this.$route.path.indexOf(subpath) > -1;
          isActive = isActive && this.$route.path.indexOf("fund") > -1;
          if (isActive) break;
        }
      }
      if (path === "/orders") {
        for (const subpath of [
          "open-order",
          "order-history",
          "trade-history"
        ]) {
          isActive = this.$route.path.indexOf(subpath) > -1;
          isActive = isActive && this.$route.path.indexOf("orders") > -1;
          if (isActive) break;
        }
      }
      const showExchangeBottom =
        (path === "/exchange" || path === "/contest" || path === "/dot") &&
        isActive;
      return {
        "btn-jump": true,
        "active-link": isActive,
        "exchange-link": showExchangeBottom,
        "exchange-link-small": showExchangeBottom && this.height === 40
      };
    },
    switchLang(lang) {
      this.openLanMenu = false;
      this.$router.push(this.$route.fullPath.replace(/^\/[^\/]+/, "/" + lang));
    },
    onLogoutClick() {
      this.$toggleLogout();
    },
    drawPortrait() {
      this.$nextTick(() => {
        const canvas = document.querySelector("canvas");
        if (canvas && canvas.getContext) {
          const context = canvas.getContext("2d");
          if (context) {
            jdenticon.drawIcon(context, sha256(this.username), 64);
          }
        }
      });
    },
    async onUnlockClicked() {
      await this.$store
        .dispatch("auth/toggleLock", this.$i18n.path("/"))
        .then(res => {
          if (res) {
            this.$message({
              message: this.$t("message.locked_succ")
            });
          }
        });
    },
    /**
     * 总成交量, 根据ETH换算
     * 自定义与交易大赛不用计算值
     */
    async get24hVolumeByETH() {
      const digits = await this.cybexjs.queryAsset(this.volumeCoin);
      const func = async () => {
        let v = await this.cybexjs.allMarket(this.volumeCoin);
        this.$store.commit(
          "exchange/SET_24h_VOLUME",
          parseFloat(v).toFixed(digits.precision)
        );
      };
      if (!this.is_contest && !this.asset_is_custom) {
        await func();
        if (!this.intervalVolume) {
          this.intervalVolume = setInterval(func, 1000 * 60);
        }
      }
    }
  },
  async mounted() {
    // 24小时总成交量
    await this.get24hVolumeByETH();
    // this.drawPortrait();
    this.settingItems = this.getSettingItems();
  },
  beforeDestroy() {
    clearInterval(this.intervalVolume);
  }
};
</script>

<style lang="stylus">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

// 下拉菜单
.nav-menu-wrapper {
  display: flex;
  height: 100%;
  align-items: center;
  min-width: 80px;

  &.column {
    flex-direction: column;
  }

  &.icon {
    min-width: 56px;
  }

  &.activity {
    // min-width: 108px;
  }

  .v-menu__activator {
    height: 100%;
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}

.overflow-username {
  max-width: 74px;
  min-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;

  &.keep-inline {
    max-width: 89px;
  }
}

.asset-menu {
  cursor: pointer;
}

.nav-menu {
  box-shadow: 0 16px 32px -16px rgba(0, 0, 0, 0.24);
  border-radius: 4px;
  background: $main.anchor;
  display: flex;
  min-width: 80px !important;

  // &.icon {
  // max-width: 69px !important;
  // min-width: 69px !important;
  // width: 69px !important;
  // }
  .theme--dark.v-list {
    width: 100%;
    background: $main.anchor !important;

    // .active-link {
    // .v-list__tile {
    // color: $main.grey;
    // }
    // }
    .v-list__tile {
      font-size: 12px;
      f-cybex-style('heavy');
      height: 32px;
      padding: 0;
      color: rgba($main.white, 0.8);
      > * {
        padding: 0 10px;
      }
      a {
        color: rgba($main.white, 0.8);
        width: 100%;
        height: 100%;
        display: block;
      }

      &:hover {
        color: white;

        a {
          color: white;
        }

        background-color: rgba($main.white, 0.04);
      }
    }

    .v-list__tile__title {
      text-align: center;
    }
  }
}

.cybex-nav {
  .v-toolbar__content {
    > div {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;

      &.user-notice-fixed {
        position: fixed;
        top: 20px;
        right: 0;
        width: 94px;
        height: 28px;
        border-top-left-radius: 100px;
        border-bottom-left-radius: 100px;
        background-color: #293246;
        color: #d7333d;
        cursor: pointer;
        padding: 10px;
        z-index: 999999;
        transition: all 1s;

        &.not-show {
          transform: translateX(120px);
        }

        &:hover {
          opacity: 0.9;
        }
      }
    }

    padding: 0;
    word-break: keep-all;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    background: $main.lead !important;
    box-shadow: inset -1px 0 0 0 $main.noir;
  }

  .v-icon {
    font-size: 24px;
  }

  // logo
  .logo-banner {
    height: 100%;
    width: 100%;
    display: flex;
    padding: 0 20px;
    align-items: center;
    flex: 0 0 0;

    img {
      filter: brightness(1.3);
      margin: 0px 0px 0px 6px;
      height: 20px;
    }
  }

  // 24小时总成交
  .volume24h {
    min-width: 144px;
    font-size: 12px;
    padding: 0 20px;
    display: flex;
    flex-direction: column;

    .label {
      color: rgba($main.white, 0.5);
      padding: 4px 0;
    }

    .volume {
      f-cybex-style('heavy');
    }
  }

  .v-menu__activator--active {
    .btn-jump {
      color: $main.orange;
    }
  }

  .btn-jump {
    &.full-width {
      width: 100%;
    }

    f-cybex-style('black');
    color: $main.grey;
    margin: 0 16px;
    height: 80%;
    display: flex;
    align-items: center;
    justify-content: space-around;

    &.active-link {
      color: $main.orange;

      &.exchange-link {
        height: calc(100% - 18px);
        display: block;
        transform: translateY(calc(50% + 2px));
        position: relative;

        &:after {
          content: '';
          display: block;
          width: 100%;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background-image: $gradients.goldex;
          height: 4px;
          border: none;
          top: calc(50% - 2px);
          position: relative;
        }
      }
    }
  }

  // 交易所连接tab
  .exchange-tab {
    display: flex;
    align-items: center;
    padding: 0;
    flex-direction: column;
    flex: 0 0 0;
  }

  .lang-select {
    width: 93px;
    text-align: right;
    color: $main.grey;
    padding: 0 4px 0 16px;
    font-size: 12px;
    f-cybex-style('black');

    &.border-left {
      border-left: 1px solid $main.noir;
    }

    .lang-item {
      color: rgba($main.white, 0.8);
      font-size: 12px;
      line-height: 1.33;
      f-cybex-style('heavy');
    }

    .ic-arrow_up, .ic-arrow_drop_down {
      font-size: 24px;
    }

    .v-menu__activator--active {
      color: $main.orange;

      .ic-arrow_up:before {
        color: $main.orange;
      }

      .ic-arrow_drop_down:before {
        color: $main.orange;
      }
    }
  }

  // 切换用户头像
  .toggle-user-wrapper {
    display: flex;
    align-items: center;
    height: 100%;
  }

  // 用户头像 名字
  .portrait-link {
    height: 100%;
    color: $main.white;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 16px;
    border-left: 1px solid $main.noir;

    p {
      margin-bottom: 0px !important;
      line-height: 64px;
      margin-left: 16px;
    }

    .link-btn {
      width: 100%;

      &.settings {
        height: 100%;
        display: inline-flex;
        align-items: center;
      }
    }

    button {
      width: 36px;
      height: 36px;
      margin: 0;
    }
  }

  // 图标集合
  .nav-icons {
    height: 100%;
    align-items: center;
    border-left: 1px solid $main.noir;
    display: flex;
    flex: 0 1 auto;
    padding-left: 8px;
  }

  // 覆写toolbal
  .theme--dark.v-toolbar {
    background: $main.lead;
    overflow-x: auto;
    word-break: keep-all;
    white-space: nowrap;
  }

  .divider {
    box-shadow: inset -1px 0 0 0 $main.noir;
    height: 100%;
    width: 2px;
  }
}
</style>
