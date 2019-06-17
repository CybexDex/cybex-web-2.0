<template>
  <v-dialog width="488" :height="203" :content-class="'permission'" v-model="isShowDialog">
    <a class="btn-close" @click="closeDialog" icon>
      <v-icon>ic-close</v-icon>
    </a>
    <h2 class="dialog-title">{{ $t("title.permission") }}</h2>
    <div>
      <h1 class="userinfo" :title="username">{{ username }} <span v-if="userId" class="userinfo-id">{{ 'ID: ' + userId }}</span></h1>
      <div v-if="!verifiedPassword">
        <v-flex xs12 class="password">
          <cybex-text-field
            middle
            :disabled="verifying"
            @keyup.enter="checkPassword()"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="ic-lock_outline"
            :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
            :rules="passwordRules"
            v-model="password"
            :placeholder="$t('placeholder.enter_password')"
            @click:append="showPassword=!showPassword"
            :error-messages="passwordError"
            required
          />
          <cybex-btn :disabled="verifying || !password" block major @click="checkPassword()"> 
            {{ islocked ? $t('button.show_keys') : $t('button.show_keys_unlocked') }}
          </cybex-btn>
        </v-flex>
      </div>
      <div v-else> 
        <div class="notice-warning">
          <v-icon class="mr-2">ic-info-orange</v-icon>
          <span>{{ $t('info.permission_notice') }}</span>
        </div>
        <div class="mb-4 keys">
          <div class="form_label">{{ $t('form_label.publicK') }}:</div>
          {{ keys.pub }}
        </div>
        <div class="keys">
          <div class="form_label">{{ $t('form_label.privateK') }}:</div>
          {{ keys.wif }}
        </div>
      </div>
    </div>
    <span v-if="tips" class="tips" v-text="tips"/>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: "isShow",
    event: "update-is-show"
  },
  data() {
    return {
      tips: "",
      verifying: false,
      verifiedPassword: false,
      password: "",
      passwordError: "",
      showPassword: false,
      passwordRules: [
        value => !!value || this.$t("validation.pwd_required")
      ],
      keys: {}
    };
  },
  async mounted() {
    if (!this.userId) {
      await this.$store.dispatch('auth/getUserId');
    }
  },
  computed: {
    ...mapGetters({
      info: "auth/info",
      userId: 'auth/userId',
      islocked: "auth/islocked",
      username: "auth/username"
    }),
    isShowDialog: {
      get() {
        return this.isShow;
      },
      async set(val) {
        this.$emit("update-is-show", val);
      }
    }
  },
  watch: {
    password() {
      this.passwordError = [];
    }
  },
  methods: {
    async getKeys() {
      return await this.$store.dispatch('auth/unlock', {password: this.password, toggleDialog: false}).then(async res => {
        if (res) {
          let result = await this.cybexjs.findWif();
          this.keys = result;
          return true;
        } else {
          this.passwordError = this.$t("validation.pwd_wrong");
          return false;
        }
      }).catch(e => {
        // 解锁成功但是多签账户无法拿到对应私钥，提示没有权限
        this.passwordError = this.$t("validation.priKey_invalid");
        return false;
      })
    },
    closeDialog() {
      this.isShowDialog = false;
      this.$nextTick(() => {
        this.password = '';
        this.passwordError = '';
        this.keys = {};
        this.verifiedPassword = false;
      })
    
    },
    async checkPassword() {
      this.verifying = true;
      const getKey = await this.getKeys();
      if (getKey) {
        setTimeout(() => {
          this.verifiedPassword = true;
          this.verifying = false;
        }, 1000)
      } else {
        setTimeout(() => {
          this.verifying = false;
        }, 1000);
      }
    }
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.cybex {
  .v-dialog {
    &.permission {
      padding: 40px 32px 56px;
      background: $main.lead;
      min-height: 203px;
      position: relative;

      .dialog-title {
        font-size: 18px;
        f-cybex-style('black');
        margin-bottom: 16px;
        line-height: 1.71;
      }
      .userinfo {
        font-size: 16px;
        margin: 24px 0;
        opacity: 0.8;
        f-cybex-style('heavy');
        .userinfo-id {
          f-cybex-style('medium');
          font-size: 12px
          padding: 3px 8px 5px;
          margin-left: 4px;
          min-width: 65px;
          color: $main.grey;
          height: 20px;
          border-radius: 4px;
          background-image: linear-gradient(285deg, rgba($main.grey, 0.1), rgba($main.grey, 0.3));
          display: inline-block;
          line-height: 16px;
          position: relative;
          top: -2px;
        }
      }
      .keys {
        min-height: 34px;
      }
      .notice-warning {
        .v-icon {
          width: 18px;
          top: -2px;
          position: relative;
          background-size: cover;
        }
        color: rgba($main.orange, 0.8);
        display: flex;
        margin: 8px 0 14px;
        line-height: 18px;
      }

      font-size: 12px;

      .form_label {
        color: rgba($main.white, 0.4);
        margin-bottom: 8px;
      }
    }
  }
}
</style>