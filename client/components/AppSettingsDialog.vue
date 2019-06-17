<template>
  <v-dialog width="464" :height="320" :content-class="'general-settings'" v-model="isShowDialog">
    <a class="btn-close" @click="closeDialog" icon>
      <v-icon>ic-close</v-icon>
    </a>
    <h2 class="dialog-title">{{ $t("title.general") }}</h2>
    <div class="select-label">{{ $t("form_label.unlock-time") }}</div>
    <v-select
      solo
      class="large-size"
      :menu-props="{'offset-y': true, nudgeBottom: '6'}"
      :items="lockTimes"
      v-model="selectedTime"
    />
    <cybex-btn major middle block @click="setUnlockTime">{{ $t('button.ok') }}</cybex-btn>
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
      selectedTime: null,
      lockTimes: [
        { text: "5 min", value: 5 },
        { text: "20 min", value: 20 },
        { text: "60 min", value: 60 }
      ]
    };
  },
  computed: {
    ...mapGetters({
      info: "auth/info",
      username: "auth/username"
    }),
    isShowDialog: {
      get() {
        return this.isShow;
      },
      set(val) {
        this.$emit("update-is-show", val);
      }
    }
  },
  async created() {
    // 读取用户设置
    if (this.username) {
      this.selectedTime = await this.$store.dispatch('auth/getUnlockPeriod', this.username) / 60;
    }
  },
  methods: {
    closeDialog() {
      this.isShowDialog = false;
    },
    async setUnlockTime() {
      await this.$store.dispatch('auth/setUnlockPeriod', {username: this.username, val: this.selectedTime})
      this.tips = this.$t("message.unlock_changed");
      setTimeout(() => {
        this.tips = "";
      }, 5000);
    }
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.cybex {
  .v-dialog {
    &.general-settings {
      padding: 40px 32px 56px;
      background: $main.lead;
      min-height: 320px;
      position: relative

      .dialog-title {
        font-size: 28px;
        f-cybex-style('black');
        margin-bottom: 16px;
        line-height: 1.71;
      }

      .tips {
        color: rgba($main.glass, 0.8);
        position: absolute;
        bottom: 30px;
      }
    }
  }
}
</style>