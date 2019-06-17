<template>
  <v-dialog v-model="isShowUnlock" persistent :content-class="isCloud ? 'unlock-panel' : 'unlock-panel is-local'" width="464">
    <a class="btn-close" @click="isShowUnlock=false" icon>
      <v-icon>ic-close</v-icon>
    </a>
    <h2 class="unlock-title">{{ $t('title.unlock') }}</h2>
    <v-form ref="form" lazy-validation @submit.prevent="onUnlockClicked">
      <v-layout row wrap>
        <v-flex xs12 class="mb-3" v-if="isCloud">
          <h4 class="unlock-label">{{ $t('placeholder.account_name') }}</h4>
        </v-flex>
        <v-flex xs12 align-center d-flex class="mb-4" v-if="isCloud">
          <span class="usrname-ic ic-avatar"/>
          <span class="usrname" :title="username">{{ username }}</span>
        </v-flex>
        <v-flex xs12 class="mb-2">
          <h4 class="unlock-label">{{ $t('placeholder.password') }}</h4>
        </v-flex>
        <v-flex xs12 class="password">
          <cybex-text-field
            middle
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="ic-lock_outline"
            :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
            :rules="passwordRules"
            v-model="password"
            :placeholder="$t('placeholder.enter_password')"
            @click:append="showPassword=!showPassword"
            required
          />
        </v-flex>
      </v-layout>
      <cybex-btn
        block
        middle
        class="text-capitalize"
        :disabled="!password || unlocking"
        @click="onUnlockClicked"
      >{{ $t('button.unlock') }}</cybex-btn>
    </v-form>
  </v-dialog>
</template>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.unlock-panel {
  overflow: hidden;
  background: $main.lead;
  padding: 10px 20px;
  width: 464px;
  height: 418px;
  padding: 42px 32px !important;
  &.is-local {
    height: 330px;
  }

  .usrname-ic {
    flex: 0 0 24px !important;
    font-size: 30px;
    opacity: 0.5;
    margin: 0 12px;
  }

  .usrname {
    f-cybex-style('heavy');
    color: rgba($main.white, 0.3);
    font-size: 14px;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-top: 3px;
  }

  .v-text-field {
    &.v-text-field--solo {
      .v-input__icon--prepend-inner {
        margin-right: 10px;
        margin-left: 7px;
      }
    }

    .v-input__slot {
      background: $main.independence !important;

      input {
        f-cybex-style('heavy');
      }
    }
  }

  .unlock-title {
    f-cybex-style('black');
    font-size: 24px;
    color: $main.white;
    line-height: 48px;
    height: 48px;
    margin-bottom: 28px;
  }

  .unlock-label {
    font-size: 12px;
    f-cybex-style('heavy');
    line-height: 2;
    height: 24px;
  }
}
</style>

<script>
import { mapGetters } from "vuex";
import { keys } from "lodash";
import config from "~/lib/config/config.js";

export default {
  data() {
    return {
      showPassword: false,
      someErr: null,
      password: "",
      nameRules: [value => !!value || this.$t("validation.account_required")],
      passwordRules: [value => this.checkPwd(value)],
      unlocking: false
    };
  },
  computed: {
    ...mapGetters({
      isCloud: "auth/isCloud",
      username: "auth/username",
      bases: "user/bases",
      showUnlock: "showUnlock"
    }),
    isShowUnlock: {
      get() {
        return this.showUnlock;
      },
      set(value) {
        this.$toggleLock();
      }
    }
  },
  watch: {
    isShowUnlock() {
      const form = this.$refs.form;
      if (form) {
        form.reset();
      }
      (this.showPassword = false), (this.someErr = null), (this.password = "");
    }
  },
  methods: {
    async onUnlockClicked() {
      this.unlocking = true;
      await this.$store
        .dispatch("auth/unlock", {password: this.password})
        .then(res => {
          if (res) {
            ga("send", {
              hitType: "event",
              eventCategory: "unique",
              eventAction: "UNLOCK:CLOUD",
              eventLabel: this.username
            });
            try {
              (window._czc|| []).push(["_trackEvent", "unique", this.isCloud ? "UNLOCK:CLOUD" : "UNLOCK:BIN", this.username]);
            } catch (e) {
              console.log(e)
            }
            this.$nextTick(() => {
              this.$message({
                message: this.$t("message.unlock_succ")
              });
            });
          } else {
            this.someErr = true;
            this.$refs.form.validate();
          }
        })
        .catch(e => {
          this.someErr = true;
          this.$refs.form.validate();
        })
        .finally(() => {
          this.unlocking = false;
        });
    },
    checkPwd(value) {
      if (this.someErr) {
        this.someErr = false;
        return this.$t("error.UB_fail_unlock");
      }
      return !!value || this.$t("validation.pwd_required");
    }
  }
};
</script>

