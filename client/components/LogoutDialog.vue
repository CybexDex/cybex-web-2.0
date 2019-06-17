<template>
  <v-dialog v-model="isShowLogout" persistent content-class="logout-panel" width="464">
    <v-icon class="btn-close" @click="isShowLogout=false" size="24">ic-close</v-icon>
    <h2 class="d-title">{{ $t('title.logout') }}</h2>
    <p class="logout desc">{{ isCloud ? $t('info.logout') : $t('info.local_logout') }}</p>
    <v-flex class="notify-check">
      <!-- 预加载ic-check_box_active防止出现卡顿-->
      <v-icon class="hidden" style="display:none" v-html="'ic-check_box_active'" />
      <cybex-checkbox
        middle
        class="ma-0 pa-0"
        :size="20"
        v-model="pwdCheck"
        :label="isCloud ? $t('checkbox_label.warn_no_forgot') : $t('checkbox_label.warn_no_forgot_local')"
      />
    </v-flex>
    <v-flex class="notify-check">
      <cybex-checkbox
        middle
        v-model="backupCheck"
        :label="isCloud ? $t('checkbox_label.warn_backup') : $t('checkbox_label.warn_backup_local')"
      />
    </v-flex>
    <v-flex class="notify-check">
      <cybex-checkbox
        middle
        class="ma-0 pa-0"
        v-model="wantCheck"
        :label="$t('checkbox_label.warn_really_logout')"
      />
    </v-flex>
    <cybex-btn block middle class="confirm-logout text-capitalize" :disabled="!canLogout" @click="onLogoutClick">{{ $t('button.logout') }}</cybex-btn>
  </v-dialog>
</template>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.os-windows {
  .logout-panel {
    line-height: 18px !important;
    .v-input--checkbox .v-label {
      line-height: 18px !important;
    }
  }
}

.logout-panel {
  background: $main.lead;
  width: 464px;
  font-size: 14px;
  color: rgba($main.white, 0.8);
  padding: 40px 32px 56px !important;
  line-height: 24px;
  position: relative;

  // 标题
  .d-title {
    font-size: 28px;
    f-cybex-style('black');
    line-height: 2;
    color: $main.white;
  }

  // 描述
  .desc {
    margin-bottom: 32px;
  }

  // 选项
  .notify-check {
    padding-right: 11px;
    margin-bottom: 12px;
  }
  .confirm-logout {
    margin-top: 32px;  
  }
}
</style>

<script>
import { mapGetters } from "vuex";
import { keys } from "lodash";

export default {
  data() {
    return {
      pwdCheck: false,
      wantCheck: false,
      backupCheck: false
    };
  },
  computed: {
    ...mapGetters({
      username: "auth/username",
      isCloud: "auth/isCloud",
      bases: "user/bases",
      showLogout: "showLogout"
    }),
    isShowLogout: {
      get() {
        return this.showLogout;
      },
      set(value) {
        this.$toggleLogout();
      }
    },
    canLogout() {
      return this.pwdCheck && this.wantCheck && this.backupCheck;
    }
  },
  watch: {
    isShowLogout() {
      this.pwdCheck = false;
      this.wantCheck = false;
      this.backupCheck = false;
    }
  },
  methods: {
    async onLogoutClick() {
      let redirect = this.$i18n.path('/');
      await this.$store.dispatch('auth/logout', {redirect: redirect, showLogout: true});
      
    }
  }
};
</script>

