<template>
  <v-flex class="login-bg">
    <div class="login-wrapper">
      <div class="main_tlt text-left mt-0">{{ $t('title.welcome') }}</div>
      <div class="sub_tlt text-left" v-html="$t('sub_title.jump_to_reg', { url: '/register' })"/>
      <div class="login_tlt text-left">{{ $t('button.wallet_login', { mode: modeStr }) }}</div>
      <v-form onSubmit="return false;" @submit="login" ref="form" class="cybex large" lazy-validation>
        <!-- 云钱包用户名 -->
        <cybex-text-field
          v-if="isCloudMode"
          v-model="name"
          :class="accountClass"
          class="login-account"
          prepend-inner-icon="ic-avatar"
          :error-messages="nameRules"
          :label="$t('placeholder.account_name')"
          outline
          :solo="false"
        />
        <!-- 本地钱包 bin文件 -->
        <cybex-file-upload v-else :file-accept="'.bin'" @file-changed="fileChanged"/>
        <cybex-text-field
          v-model="password"
          :class="pwdClass"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="ic-lock_outline"
          :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
          @click:append="showPassword=!showPassword"
          :error-messages="passwordRules"
          :label="$t('placeholder.password')"
          outline
          :solo="false"
        />
        <div
          v-if="someErr"
          class="login-error text-left mt-2"
        >{{ $t("validation.account_not_exists") }}</div>
        <cybex-btn
          block
          middle
          type="submit"
          class="login-btn text-capitalize"
          :disabled="!couldLogin"
        >{{ $t('button.login') }}</cybex-btn>
      </v-form>
      <div class="toggle-login" @click="toggleLoginMode()">
        {{ $t('wallet.toggle', { mode: modeRelativeStr }) }}
        <v-icon class="arrow" size="16">ic-arrow-back</v-icon>
      </div>
      <div
        class="toggle-login restore"
        v-if="!isCloudMode"
        @click="redirectToStorePage"
      >{{ $t('wallet.restore_wallet') }}</div>
    </div>
  </v-flex>
</template>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.toggle-login {
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  height: 24px;
  width: 171px;
  margin: 0 auto;
  line-height: 1.33;
  color: $main.grey;
  f-cybex-style('heavy');
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .arrow {
    position: relative;
    top: -2px;
    left: 4px;
    transform: rotate(180deg);

    &:before {
      color: $main.grey;
    }
  }

  &.restore {
    right: 32px;
    justify-content: flex-end;
  }
}

.login-bg {
  width: 100%;
  height: 100%;
  min-width: 800px;
  text-align: center;
  background: url('~assets/images/index.jpg') center center repeat-y;
  background-size: cover;
  // align center vertically;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  .login-wrapper {
    position: relative;
    margin: 0 auto;
    padding: 40px 32px;
    background: $main.lead;
    border-radius: 4px;
    height: 491px;
    width: 464px;

    .main_tlt {
      font-size: 28px;
      f-cybex-style('black', 'heavy');
      line-height: 1.71;
    }

    .sub_tlt {
      font-size: 14px;
      line-height: 1.71;
      color: $main.white80;

      a {
        f-cybex-style(heavy);
        color: $main.grey !important;
      }
    }

    .login_tlt {
      font-size: 16px;
      line-height: 1.5;
      margin: 47px 0 26px;
      f-cybex-style('heavy');
      color: white;
    }

    .login-error {
      font-size: 12px;
      position: absolute;
      color: $main.crimson;
    }

    .login-btn {
      margin-top: 32px;
    }

    .login-account {
      .v-input__control {
        .v-input__icon--prepend-inner {
          border-radius: 50%;
          width: 32px;
          height: 32px;
          margin: 0 12px 0 0 !important;
          background-image: linear-gradient(312deg, rgba(120, 129, 154, 0.1), rgba($main.grey, 0.3));
        }
      }
    }
  }
}
</style>


<script>
import { g } from "~/lib/cybex_help";
import { mapActions, mapGetters } from "vuex";
import utils from "~/components/mixins/utils";
import config from "~/lib/config/config.js";
export default {
  data() {
    return {
      hasSubmitted: false,
      name: "",
      message: "",
      password: "",
      showPassword: false,
      showLogined: false,
      someErr: false,
      errCheckTimes: 0,
      inLogin: false,
      loginMode: null,
      file: null
    };
  },
  mixins: [utils],
  head() {
    return {
      title: this.$t("title.login")
    };
  },
  watch: {
    // 提交过代码并且有报错时，当用户重新输入表单值时，隐藏错误
    name() {
      this.onInputChanged();
    },
    password () {
      this.onInputChanged();
    }
  },
  computed: {
    ...mapGetters({
      LOGIN_MODE_CLOUD: "auth/LOGIN_MODE_CLOUD",
      LOGIN_MODE_LOCAL: "auth/LOGIN_MODE_LOCAL"
    }),
    isCloudMode() {
      return !this.loginMode || this.loginMode == this.LOGIN_MODE_CLOUD;
    },
    modeStr() {
      return this.isCloudMode
        ? this.$t("wallet.Cloud")
        : this.$t("wallet.Local");
    },
    modeRelativeStr() {
      return !this.isCloudMode
        ? this.$t("wallet.Cloud")
        : this.$t("wallet.Local");
    },
    couldLogin() {
      let checkCondition = this.name && this.password;
      if (!this.isCloudMode) {
        checkCondition = this.file && this.password;
      }
      return checkCondition && !this.inLogin;
    },
    accountClass() {
      return {
        "name-input": true,
        "name-visited": !!this.name
      };
    },
    pwdClass() {
      return {
        "pwd-input": true,
        "pwd-visited": !!this.password
      };
    },
    nameRules: function() {
      return this.hasSubmitted && !this.name
        ? this.$t("validation.account_required")
        : "";
    },
    passwordRules: function() {
      return this.hasSubmitted && !this.checkPwd()
        ? this.$t("validation.pwd_required")
        : "";
    }
  },
  methods: {
    ...mapActions({
      authLogin: "auth/login"
    }),
    fileChanged(file) {
      this.readBinFile(file);
    },
    readBinFile(file) {
      if (!file) {
        this.file = null;
        return false;
      }
      const reader = new FileReader();
      reader.onload = evt => {
        this.file = new Buffer(evt.target.result, "binary");
      };
      reader.readAsBinaryString(file);
    },
    redirectToStorePage() {
      this.$router.push(this.$i18n.path("/settings/restore"));
    },
    toggleLoginMode() {
      // 清空表单验证
      this.someErr = false;
      this.password = null;

      this.$refs.form.resetValidation();

      this.loginMode =
        !this.loginMode || this.loginMode == this.LOGIN_MODE_CLOUD
          ? this.LOGIN_MODE_LOCAL
          : this.LOGIN_MODE_CLOUD;
    },
    // 成功登陆后的处理
    async authLoginSuccessDeal() {
      // 文字提示
      this.$message({
        message: this.$t("message.login_succ")
      });
      try {
        let modeName = this.isCloudMode ? "CLOUD" : "LOCAL";
        // GA统计
        ga("send", {
          hitType: "event",
          eventCategory: "unique",
          eventAction: "LOGIN_DONE:" + modeName,
          eventLabel: this.name
        });
        (window._czc|| []).push(["_trackEvent", "unique", "LOGIN_DONE:" + modeName, this.name]);
      } catch (e) {
        // 统计报错不影响登录信息
        console.log(e)
      }
      // url跳转
      const fromUrl = this.$route.query.from;
      // 云钱包跳转到登录前页面或者交易所
      let url = fromUrl ? fromUrl : this.$i18n.path("/exchange");
      // 本地钱包检查是否有备份记录
      // 若无 强制跳转到备份页 后续同云钱包
      // if (!this.isCloudMode) {
      //   const hasBackup = false;
      //   url = !hasBackup
      //     ? this.$i18n.path("/settings/backup")
      //     : url;
      // }
      console.log("redirect to ", url);
      this.$router.push(url);
    },
    async login(event) {
      if (!this.couldLogin) {
        return;
      }
      this.inLogin = true;
      this.hasSubmitted = true;
      let logined = false;
      // try {
      const mode = this.isCloudMode
        ? this.LOGIN_MODE_CLOUD
        : this.LOGIN_MODE_LOCAL;
      // console.log(" this.file ", this.file);
      await this.authLogin({
        username: this.name,
        password: this.password,
        mode: mode,
        walletFile: this.file
      })
        //登录成功
        .then(async res => {
          if (res) {
            this.someErr = false;
            await this.authLoginSuccessDeal();
          } else {
            new Error("login failed");
          }
        })
        // 登录失败
        .catch(e => {
          this.someErr = true;
          this.errCheckTimes = 0;
          this.$refs.form.validate();
          console.error(e);
        })
        // 清除正在登录状态
        .finally(() => {
          this.inLogin = false;
        });
      // logined = await this.$call(
      //   this.cybexjs.unlock,
      //   this.name,
      //   this.password,
      //   config.unlockPeriod
      // );
      // ga("send", {
      //   hitType: "event",
      //   eventCategory: "unique",
      //   eventAction: "LOGIN_DONE:CLOUD",
      //   eventLabel: this.name
      // });
      // } catch (e) {
      //   this.someErr = true;
      //   this.$refs.form.validate();
      // }
      // this.inLogin = false;
      // if (logined && logined.code === 0) {
      //   this.$message({
      //     message: this.$t("message.login_succ")
      //   });
      //   this.$nextTick(() => {
      //     if (this.$route.query.from) {
      //       this.$router.push(this.$route.query.from);
      //     } else {
      //       this.$router.push(this.$i18n.path("/exchange"));
      //     }
      //   });
      // } else {
      //   this.someErr = true;
      //   this.errCheckTimes = 0;
      //   this.$refs.form.validate();
      // this.someErr = false
      // }
      return false;
    },
    onInputChanged() {
      const form = this.$refs.form;
      if (form && this.someErr) {
        this.someErr = false;
      }
    },
    checkPwd() {
      this.errCheckTimes++;
      if (this.errCheckTimes > 1) {
        this.someErr = false;
        this.errCheckTimes = 0;
      }
      return !!this.password;
    }
  },
  mounted() {
    window.jumpTo = this.$i18n.jumpTo;
  }
};
</script>
