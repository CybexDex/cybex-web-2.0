<template>
  <v-container align-center class="register">
    <v-layout class="register-form-wrapper mt-2" row wrap>
      <v-flex xs8>
        <div style="width:456px;">
          <v-form ref="form" @submit.prevent="createAccount" lazy-validation>
            <v-layout row wrap>
              <v-flex xs12>
                <h1 class="main-title mb-1">{{ $t('sub_title.create_wallet', {mode: modeStr}) }}</h1>
                <h3 class="sub-title">{{ $t('sub_title.fill_field') }}</h3>
              </v-flex>
              <!-- account name -->
              <v-flex xs12 class="mt-5">
                <cybex-text-field
                  large
                  prepend-inner-icon="ic-avatar"
                  v-model="name"
                  @input="onAccountNameChanged"
                  clearable
                  :placeholder="$t('placeholder.enter_account')"
                  :label="$t('form_label.account_name')"
                  :rules="nameRules"
                  required
                />
              </v-flex>
              <!-- recomended password -->
              <v-flex xs12 class="mb-4" v-if="isCloudMode">
                <cybex-switch
                  :ripple="false"
                  class="d-flex align-center mt-0 pt-0"
                  v-model="useGenerated"
                >
                  <div slot="label">
                    <span>{{ $t('form_label.recommand_pwd') }}</span>
                    <notice-tip slot="append" :content="$t('tooltip.generated')" :offset="120"/>
                  </div>
                </cybex-switch>
              </v-flex>
              <v-flex xs12 v-if="useGenerated && isCloudMode">
                <v-layout row wrap class="show-generated">
                  <cybex-text-field
                    large
                    label
                    :value="generated"
                    :copy-icon="'ic-copy not-narrow'"
                    :multi-text="false"
                    :copy-icon-cb="onCopy"
                    readonly
                  />
                  <!-- <v-flex xs10 class="text-left">
                    {{ generated }}
                  </v-flex>
                  <v-flex xs2>
                    <div class="text-right">
                      <v-btn flat @click="onCopy" class="btn-copy">
                        <v-icon>ic-copy</v-icon>
                      </v-btn>
                    </div>
                  </v-flex>-->
                </v-layout>
              </v-flex>
              <!-- password & repeat password -->
              <v-flex xs12 class="password-wrap">
                <cybex-text-field
                  large
                  :type="showPassword ? 'text' : 'password'"
                  :class="`pwd-input ${useGenerated ? 'generated-field' : ''}`"
                  prepend-inner-icon="ic-lock_outline"
                  :label="$t('form_label.password')"
                  :placeholder="$t('placeholder.enter_password')"
                  :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
                  @click:append="showPassword=!showPassword"
                  v-model="password"
                  :rules="passwordRules"
                  @input="onPasswordChanged"
                  clearable
                  required
                />
              </v-flex>
              <v-flex xs12>
                <cybex-text-field
                  large
                  class="pwd-input"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="$t('placeholder.enter_pwdrepeat')"
                  :label="$t('form_label.repeatpwd')"
                  prepend-inner-icon="ic-lock_outline"
                  :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
                  v-model="repeatpwd"
                  :rules="repeatpwdRules"
                  @click:append="showPassword=!showPassword"
                  clearable
                  required
                />
              </v-flex>
              <!-- notify -->
              <v-flex xs12>
                <v-flex xs12 class="notify-check">
                  <cybex-checkbox
                    middle
                    v-model="warnForgot"
                    :label="$t('checkbox_label.warn_no_forgot')"
                  />
                </v-flex>
                <v-flex xs12 class="notify-check">
                  <cybex-checkbox
                    middle
                    v-model="warnNoRestore"
                    :label="$t('checkbox_label.warn_no_restore')"
                  />
                </v-flex>
                <v-flex xs12 class="notify-check mb-4">
                  <cybex-checkbox
                    middle
                    v-model="warnBackup"
                    :label="$t('checkbox_label.warn_backup')"
                  />
                </v-flex>
              </v-flex>
              <!-- vertification code -->
              <v-flex xs12 class="mt-2">
                <cybex-text-field
                  large
                  v-model="captcha"
                  prepend-inner-icon="ic-pincode"
                  :label="$t('form_label.validation')"
                  :placeholder="$t('validation.validcode_required')"
                  :rules="validcodeRules"
                  required
                >
                  <template slot="append" bottom>
                    <a v-if="verifyCode" @click="refreshCaptch()" class="captcha-field">
                      <span v-html="verifyCode.data"/>
                    </a>
                  </template>
                </cybex-text-field>
              </v-flex>
              <v-flex xs12 class="pin-code">
                <cybex-btn
                  block
                  middle
                  class="text-capitalize"
                  :disabled="!canCreate || inRegister"
                  @click="createAccount"
                >{{ $t('button.create_account') }}</cybex-btn>
              </v-flex>
            </v-layout>
          </v-form>
        </div>
      </v-flex>
      <v-flex xs4>
        <div class="right-wrapper">
          <div class="toggle-login" @click="toggleRegisterMode()">
            {{ $t('wallet.toggle', {mode: modeRelativeStr}) }}
            <v-icon class="arrow" size="16">ic-arrow-back</v-icon>
          </div>
          <div class="title-desc">
            <v-icon class="mr-2">ic-info-orange</v-icon>
            <span class="pt-1">{{ $t('sub_title.about_wallet', { mode: modeStr }) }}</span>
          </div>
          <template v-if="isCloudMode">
            <p class="wallet-desc mt-3">{{ $t('info.cloud_wallet_desc1') }}</p>
            <p class="wallet-desc mt-4">{{ $t('info.cloud_wallet_desc2') }}</p>
            <div class="mt-2"/>
            <span class="flex-tips">{{ $t('tag.single') }}</span>
            <span class="flex-tips">{{ $t('tag.simple') }}</span>
          </template>
          <template v-else>
            <p class="wallet-desc mt-3">{{ $t('wallet.register_desc1') }}</p>
            <p class="wallet-desc mt-4">{{ $t('wallet.register_desc2') }}</p>
            <div class="mt-2"/>
            <span class="flex-tips">{{ $t('wallet.tag-multiple') }}</span>
            <span class="flex-tips">{{ $t('wallet.tag-backup') }}</span>
            <span class="flex-tips">{{ $t('wallet.tag-safe') }}</span>
          </template>
        </div>
      </v-flex>
    </v-layout>
    <v-flex class="back-to-login">
      <span>{{ $t('info.ready_exist') }}</span>
      <router-link :to="$i18n.path('/')">{{ $t('info.login_here') }}</router-link>
      <template v-if="!isCloudMode">
        <span>{{ $t('info.or') }}</span>
        <router-link :to="$i18n.path('/settings/restore')">{{ $t('wallet.restore_wallet') }}</router-link>
      </template>  
    </v-flex>
  </v-container>
</template>

<style lang="stylus" scoped>
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.register {
  font-size: 14px;
  padding-top: 48px;

  .register-form-wrapper {
    width: 800px;
    margin: 0 auto;
    position: relative;

    .toggle-login {
      cursor: pointer;
      position: absolute;
      left: 0;
      top: 10px;
      height: 24px;
      width: 171px;
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.1);
      margin: 0 auto;
      padding: 3px 4px 0 8px;
      color: $main.white;
      f-cybex-style('heavy');
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-around;

      .arrow {
        position: relative;
        top: -1px;
        padding-right: 8px;
        transform: rotate(180deg);

        &:before {
          color: $main.white;
        }
      }
    }
  }

  .notify-check:not(:last-child) {
    margin-bottom: 12px;
  }

  .right-wrapper {
    padding-top: 116px;
    position: relative;

    // width: 248px;
    .title-desc {
      height: 24px;
      font-size: 16px;
      f-cybex-style('heavy');
      width: 248px;
      display: flex;
      align-items: center;
    }

    .wallet-desc {
      font-weight: normal;
      font-size: 14px;
      line-height: 1.71;
      width: 248px;
      color: rgba($main.white, 0.8);
    }

    .flex-tips {
      font-size: 14px;
      background: rgba($main.grey, 0.1);
      color: white;
      padding: 6px 16px;
      border-radius: 16px;
      display: inline-flex;
      min-height: 32px;
      align-items: center;
      margin: 10px 4px 0 0;
    }
  }

  li {
    font-size: 14px;
    f-cybex-style(medium);
    line-height: 1.71;
  }

  .back-to-login {
    text-align: center;
    margin-top: 70px;
    color: rgba($main.grey, 0.3);

    a {
      color: rgba($main.grey, 1);
      f-cybex-style('heavy');
    }
  }
}
</style>


<script>
import clipboard from "clipboard-polyfill";
import { main, g } from "~/lib/cybex_help";
import utils from "~/components/mixins/utils";
import userValid from '~/components/mixins/user-valid.js';
import { mapGetters } from "vuex";
import config from "~/lib/config/config.js";
import { debounce } from "lodash";
import { LOGIN_MODE_LOCAL, LOGIN_MODE_CLOUD } from "~/lib/user";

export default {
  components: {
    NoticeTip: () => import("~/components/NoticeTip.vue")
  },
  data() {
    return {
      registerMode: LOGIN_MODE_CLOUD,
      message: "",
      verifyCode: {},
      isAccountChecked: false,
      isAccountValid: false,
      isAccountNew: false,
      showCopied: false,
      showPassword: false,
      useGenerated: false,
      warnForgot: false,
      warnNoRestore: false,
      warnBackup: false,
      pwdStrength: 1,
      generated: "",
      name: "",
      password: "",
      repeatpwd: "",
      captcha: "",
      nameRules: [
        value =>
          !this.isAccountValid ||
          !!value ||
          this.$t("validation.account_required"),
        value => this.checkName(value)
      ],
      passwordRules: [
        value => this.checkPassword(value) || this.$t("validation.pwd_length")
      ],
      repeatpwdRules: [
        value =>
          !this.isAccountValid ||
          (!!value
            ? value === this.password || this.$t("validation.pwd_unmatched")
            : this.$t("validation.pwd_repeat"))
      ],
      validcodeRules: [
        value =>
          !this.isAccountValid ||
          (!!value || this.$t("validation.validcode_required"))
      ],
      inRegister: false
    };
  },
  mixins: [utils, userValid],
  computed: {
    isCloudMode() {
      return this.registerMode === LOGIN_MODE_CLOUD;
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
    canCreate() {
      return (
        this.checkName(this.name, true) &&
        this.checkPassword(this.password, true) &&
        this.name &&
        this.isAccountChecked &&
        this.isAccountValid &&
        this.password &&
        this.password === this.repeatpwd &&
        this.captcha &&
        this.repeatpwd &&
        this.warnForgot &&
        this.warnNoRestore &&
        this.warnBackup &&
        this.verifyCode
      );
      // return this.warnForgot && this.warnNoRestore && this.warnBackup
    }
  },
  head() {
    return {
      title: this.$t("title.register")
    };
  },
  methods: {
    onPasswordChanged(val) {
      this.$refs.form.validate();
    },
    toggleRegisterMode() {
      this.registerMode =
        this.registerMode === LOGIN_MODE_LOCAL
          ? LOGIN_MODE_CLOUD
          : LOGIN_MODE_LOCAL;
      // 密码规则不同 重新验证
      this.$refs.form.validate();
    },
    onAccountNameChanged: debounce(async function() {
      if (!this.name) return;
      this.isAccountChecked = false;
      this.name = (this.name || "").slice(0, 64);
      try {
        this.isAccountNew = !(await this.$call(
          this.cybexjs.get_user,
          this.name
        ));
        this.isAccountChecked = true;
        this.$refs.form.validate();
      } catch (e) {
        this.isAccountNew = true;
        this.isAccountChecked = true;
        this.$refs.form.validate();
      }
    }, 200),
    checkPassword(value, returnBool) {
      if (!this.isAccountValid) {
        return true;
      }
      const checkLen = this.isCloudMode ? 12 : 8;
      if (!this.checkPasswordLength(value, checkLen)) {
        return returnBool ? false : this.$t("validation.pwd_too_short", {len: checkLen});
      }
      const validReg = this.isCloudMode ? this.checkPasswordComplex(value) : this.checkPasswordComplexSimpler(value);
      const invalidRegStr = this.isCloudMode ? this.$t("validation.pwd_number") : this.$t("validation.pwd_number_simple");
      if (!validReg) {
        return returnBool ? false : invalidRegStr;
      }
      if (!/^[ -~]+$/g.test(value)) {
        return returnBool ? false : this.$t("validation.pwd_wrong");
      }
      return true;
    },
    async createAccount() {
      const failDeal = () => {
        ga("send", {
          hitType: "event",
          eventCategory: "unique",
          eventAction: "REGISTER_FAILED",
          eventLabel: this.name
        });
        try {
          (window._czc|| []).push(["_trackEvent", "unique", "REGISTER_FAILED", this.name]);
        } catch (e) {
          console.log(e)
        }
        this.captcha = "";
        this.refreshCaptch(true);
      };
      if (this.$refs.form.validate()) {
        let isReg = false;
        this.inRegister = true;
        await this.$eventHandle(async () => {
          this.$store
            .dispatch("auth/register", {
              mode: this.registerMode,
              username: this.name,
              password: this.password,
              codeId: this.verifyCode.id,
              code: this.captcha
            })
            .then(res => {
              if (res) {
                if (this.isCloudMode) {
                  try {
                    ga("send", {
                      hitType: "event",
                      eventCategory: "unique",
                      eventAction: "REGISTER_DONE:CLOUD",
                      eventLabel: this.name
                    });
                    (window._czc|| []).push(["_trackEvent", "unique", "REGISTER_DONE:CLOUD", this.name]);
                    ga("send", {
                      hitType: "event",
                      eventCategory: "unique",
                      eventAction: "LOGIN_DONE:CLOUD",
                      eventLabel: this.name
                    });
                    (window._czc|| []).push(["_trackEvent", "unique", "LOGIN_DONE:CLOUD", this.name]);
                  } catch (e) {
                    console.log(e)
                  }
                  this.$i18n.jumpTo("/register/guide");
                } else {
                  try {
                    ga("send", {
                      hitType: "event",
                      eventCategory: "unique",
                      eventAction: "REGISTER_DONE:BIN",
                      eventLabel: this.name
                    });
                    (window._czc|| []).push(["_trackEvent", "unique", "REGISTER_DONE:BIN", this.name]);
                  } catch (e) {
                    console.log(e)
                  }
                  this.$router.push(
                    this.$i18n.path("/settings/backup?register=true")
                  );
                }
              } else {
                failDeal();
              }
            })
            .catch(e => {
              console.error(e);
              failDeal();
            })
            .finally(() => {
              this.inRegister = false;
            });
        });
        // try {
        //   this.inRegister = true;
        //   isReg = await this.$callmsg(
        //     g.register,
        //     this.name,
        //     this.password,
        //     this.verifyCode.id,
        //     this.captcha
        //   );
        // } catch (error) {}
        // this.inRegister = false;
        // if (isReg) {
        //   ga("send", {
        //     hitType: "event",
        //     eventCategory: "unique",
        //     eventAction: "REGISTER_DONE:CLOUD",
        //     eventLabel: this.name
        //   });
        //   try {
        //     const logined = await this.$callmsg(
        //       g.unlock,
        //       this.name,
        //       this.password,
        //       config.unlockPeriod
        //     );
        //     this.$nextTick(() => {
        //       if (logined) {
        //         ga("send", {
        //           hitType: "event",
        //           eventCategory: "unique",
        //           eventAction: "LOGIN_DONE:CLOUD",
        //           eventLabel: this.name
        //         });
        //         this.$i18n.jumpTo("/register/guide");
        //       } else {
        //         this.$i18n.jumpTo("/");
        //       }
        //     });
        //   } catch (e) {}
        // } else {
        //   ga("send", {
        //     hitType: "event",
        //     eventCategory: "unique",
        //     eventAction: "REGISTER_FAILED",
        //     eventLabel: this.name
        //   });
        //   this.captcha = "";
        //   this.refreshCaptch(true);
        // }
      }
    },
    checkName(value, returnBool) {
      let msg = "";
      if (/([^a-z0-9\-])/g.test(value)) {
        msg = this.$t("validation.account_no_sign");
      }
      if (!/^([a-z])/g.test(value)) {
        msg = this.$t("validation.account_alpha");
      }
      if (
        !value ||
        (value && value.length < 3) ||
        (value && value.length > 64)
      ) {
        if (value && value.length > 64) {
          msg = this.$t("validation.account_too_long");
        } else {
          msg = this.$t("validation.account_too_short");
        }
      }
      if (!/[0-9\-]+.*$/g.test(value)) {
        msg = this.$t("validation.account_slash");
      }
      if (!/^((?!\-\-).)*$/g.test(value)) {
        msg = this.$t("validation.account_slash_limit");
      }
      if (!/([a-z0-9])$/g.test(value)) {
        msg = this.$t("validation.account_number");
      }
      if (this.isAccountChecked && !this.isAccountNew) {
        msg = this.$t("validation.account_exists");
      }
      if (msg) {
        this.isAccountValid = false;
        return returnBool ? false : msg;
      } else {
        this.isAccountValid = this.isAccountNew;
      }
      return true;
    },
    onCopy() {
      clipboard.writeText(this.generated);
      this.$message({
        message: this.$t("message.copied")
      });
    },
    async refreshCaptch(isReg) {
      if (this.autoRefresh) {
        clearTimeout(this.autoRefresh);
        this.autoRefresh = null;
      }
      this.autoRefresh = setTimeout(() => {
        this.refreshCaptch();
      }, 1.5 * 60 * 1000);
      let s = await this.$callmsg(this.cybexjs.verify_code);
      this.verifyCode = s;
    }
  },
  async mounted() {
    try {
      await this.refreshCaptch();
      this.generated = await this.$call(this.cybexjs.genPassword);
    } catch (e) {}
  },
  beforeDestroy() {
    if (this.autoRefresh) {
      clearTimeout(this.autoRefresh);
      this.autoRefresh = null;
    }
  }
};
</script>