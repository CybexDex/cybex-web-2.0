<template>
  <div class="content-container-inner">
    <div class="page-head-title">{{ $t('wallet.restore_wallet') }}</div>
    <v-flex
      class="setting-desc"
    >{{ restoreByPhrase ? $t('wallet.restore_desc_phrase') : $t('wallet.restore_desc_key') }}</v-flex>
    <div class="select-label">{{ $t('form_label.restore-method') }}</div>
    <v-select
      solo
      class="large-size choose-method"
      :menu-props="{'offset-y': true, nudgeBottom: '6'}"
      v-model="restoreMethodCtrl"
      :items="restoreMethodItems"
    />
    <v-form ref="form" v-model="formIsValid" @submit="createNewWallet" onSubmit="return false">
      <cybex-text-field
        class="restore-ctrl"
        solo
        large
        :label="restoreByPhrase ? $t('wallet.phrase') : $t('wallet.key')"
        :rows="3"
        multi-text
        :placeholder="$t('placeholder.enter_field', {field: restoreByPhrase ? $t('wallet.phrase') : $t('wallet.key')})"
        v-model="restoreObj"
        @blur="validateRestoreObj"
        :error-messages="invalidRestoreObjMessages"
      />
      <cybex-text-field
        solo
        large
        class="restore-ctrl"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="ic-lock_outline"
        :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
        @click:append="showPassword=!showPassword"
        :label="$t('form_label.restore-password')"
        :placeholder="$t('placeholder.create_password')"
        v-model="password"
        :rules="passwordRules"
      />
      <cybex-text-field
        solo
        large
        class="restore-ctrl"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="ic-lock_outline"
        :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
        v-model="confirmPassword"
        @click:append="showPassword=!showPassword"
        :label="$t('form_label.restore-password-repeat')"
        :placeholder="$t('placeholder.enter_pwdrepeat')"
        :rules="repeatPasswordRules"
      />
      <cybex-btn
        type="submit"
        large
        :disabled="!couldCreateWallet"
        major
      >{{ $t('button.create-wallet') }}</cybex-btn>
    </v-form>
  </div>
</template>

<script>

import userValid from '~/components/mixins/user-valid.js';

const RESTORE_METHOD_PHRASE = 0;
const RESTORE_METHOD_KEY = 1;
export default {
  head() {
    return {
      title: this.$t("title.restore")
    };
  },
  components: {
    HintBackup: () => import("~/components/HintBackup.vue")
  },
  mixins: [userValid],
  data() {
    return {
      // form字段
      formIsValid: false,
      password: "",
      confirmPassword: "",
      restoreObj: "",
      showPassword: false,
      showSuccessPage: false,
      restoreMethodCtrl: RESTORE_METHOD_PHRASE,
      restoreMethodItems: [
        { value: RESTORE_METHOD_PHRASE, text: this.$t("wallet.phrase") },
        { value: RESTORE_METHOD_KEY, text: this.$t("wallet.key") }
      ],
      // 验证规则
      passwordRules: [
        value => !!value || this.$t("validation.pwd_required"),
        value => this.checkPasswordLength(value, 8) || this.$t("validation.pwd_too_short", {len: 8}),
        value => this.checkPasswordComplexSimpler(value) || this.$t("validation.pwd_number_simple"),
        value => this.checkPasswordInvalid(value) || this.$t("validation.pwd_wrong")
      ],
      repeatPasswordRules: [
        value => !!value || this.$t("validation.pwd_repeat"),
        value =>
          (!!value && value === this.password) ||
          this.$t("validation.pwd_unmatched")
      ],
      invalidRestoreObjMessages: []
    };
  },
  watch: {
    // 切换模式时候重新验证表单
    restoreMethodCtrl(val) {
      this.$nextTick(() => {
        this.invalidRestoreObjMessages = [];
        this.$refs.form.resetValidation();
      });
    },
    password(val) {
      if (val) {
        // rawlog('confirmPassword == val?', this.confirmPassword === val);
        this.$refs.form.validate();
      }
    }
  },
  computed: {

    // 恢复模式是否是助记词
    restoreByPhrase() {
      return this.restoreMethodCtrl === RESTORE_METHOD_PHRASE;
    },
    // 根据恢复模式显示助记词/私钥
    restoreObjField() {
      return this.restoreByPhrase
        ? this.$t("wallet.phrase")
        : this.$t("wallet.key");
    },
    // 是否能够创建钱包文件
    couldCreateWallet() {
      return this.formIsValid;
    }
  },
  methods: {
    validateRestoreObj(ev) {
      const val = ev.target.value;
      let checkValid = false;
      // 助记词至少50位
      if (this.restoreByPhrase) {
        checkValid = val.length > 50;
      } else {
      // 私钥5开头 51位
        checkValid = new RegExp(/^5/g).test(val) && val.length == 51;
      }
      console.log('checkValid', checkValid);
      if (!val) {
        this.formIsValid = false;
        this.invalidRestoreObjMessages = [
          this.$t("validation.field_required", { field: this.restoreObjField })
        ];
      } else if (!checkValid) {
        this.formIsValid = false;
        this.invalidRestoreObjMessages = [
          this.$t("validation.field_invalid", { field: this.restoreObjField })
        ];
      } else {
        this.invalidRestoreObjMessages = [];
      }
    },
    async createNewWallet() {
      if (!this.formIsValid) {
        return;
      }
      this.$store.dispatch("auth/resetWallet", {
        mode: this.restoreByPhrase ? "phrase" : "key",
        input: this.restoreObj,
        password: this.password
      }).then(res => {
        console.log('redirect to ', this.$i18n.path('/settings/success/restore'))
        this.$router.push(this.$i18n.path('/settings/success/restore'));
      }).catch(e => {
        this.formIsValid = false;
        const errmsg = e.msg ? e.msg.split('.').slice(1).join('_') : e.message;
        this.invalidRestoreObjMessages = [this.$t('error.' + errmsg)];
      })
    }
  }
};
</script>

<style lang="stylus" scoped>
@require '~assets/style/_vars/_colors';
@require '~assets/style/_fonts/_font_mixin';

.page-head-title {
  margin-bottom: 10px;
}

.setting-desc {
  padding-bottom: 32px;
}

.choose-method {
  max-width: 194px;
}

.restore-ctrl {
  max-width: 455px;
}
</style>
