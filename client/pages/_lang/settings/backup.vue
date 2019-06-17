<template>
  <div class="content-container-inner">
    <div class="page-head-title">{{ $t('sub_title.backup_wallet') }}</div>
    <v-tabs v-model="currentTab" slider-color="cybex" dark>
      <v-tab v-for="(tabItem, idx) in tabItems" :key="idx">{{ tabItem.title }}</v-tab>
      <!-- 备份用户列表开始 -->
      <v-tab-item class="backup settings-tab">
        <v-flex class="setting-desc">{{ $t('info.backup_wallet.desc') }}</v-flex>
        <v-flex class="importance grey-border-top grey-border-bottom">
          <v-flex>
            <v-icon class="notice" size="20">ic-info</v-icon>
            <span>{{ $t('sub_title.important_notice') }}</span>
          </v-flex>
          <div class="content">{{ $t('info.backup_wallet.importance') }}</div>
        </v-flex>
        <v-flex class="account-list">
          <div class="sub-title">{{ $t('sub_title.wallet_user_list') }}</div>
          <perfect-scrollbar class="ps-shown" :options="{wheelPropagation: true}">
            <v-flex class="account-list-content" column>
              <v-flex
                class="account-list-item"
                d-flex
                v-for="(account, idx) in accountList"
                :key="idx"
              >
                <v-flex d-flex class="account-name">
                  <span class="counter">{{ idx + 1 }}.</span>
                  <span>
                    <v-icon>{{ account.accessIsFull ? 'ic-avatar full' : 'ic-avatar' }}</v-icon>
                    <span class="ac-username">{{ account.name }}</span>
                  </span>
                </v-flex>
                <v-flex
                  d-flex
                  class="account-access"
                  :class="{'full' : account.accessIsFull}"
                  justify-end
                >{{ account.accessIsFull ? $t('wallet.full_access') : $t('wallet.partial_access') }}</v-flex>
              </v-flex>
            </v-flex>
          </perfect-scrollbar>
          <v-flex d-flex class="download-ctrl" @click="download">
            <div>
              <div class="l1">{{ $t('wallet.download') }}</div>
              <div class="l2">
                <span>{{ binFile.name }}</span>
                <span class="file-size">({{ binFile.size }} bytes)</span>
              </div>
            </div>
            <v-icon>ic-deposit</v-icon>
          </v-flex>
          <span
            class="to-exchange"
            @click="checkHasBackup"
            v-if="$route.query.register && clickedDownload"
          >
            {{ $t('button.exchange') }}
            <v-icon size="24">ic-arrow-back</v-icon>
          </span>
        </v-flex>
      </v-tab-item>
      <!-- 备份用户列表结束 -->
      <!-- 助记词部分开始 -->
      <v-tab-item class="phrase settings-tab">
        <v-flex class="setting-desc">{{ $t('info.phrase.desc') }}</v-flex>
        <v-flex class="importance grey-border-top">
          <v-flex>
            <v-icon class="notice" size="20">ic-info</v-icon>
            <span>{{ $t('sub_title.important_notice') }}</span>
          </v-flex>
          <div class="content">{{ $t('info.phrase.importance') }}</div>
        </v-flex>
        <v-flex class="pwd" v-if="!couldCheckphrase">
          <v-form v-model="valid" @submit="togglePhrase(true)" onSubmit="return false;">
            <cybex-text-field
              class="pwd-input"
              large
              :type="passwordIsVisible ? 'text' : 'password'"
              prepend-inner-icon="ic-lock_outline"
              :label="$t('form_label.password')"
              :placeholder="$t('placeholder.enter_password')"
              :append-icon="passwordIsVisible ? 'ic-visibility_off' : 'ic-visibility_on'"
              @click:append="passwordIsVisible=!passwordIsVisible"
              v-model="password"
              :rules="passwordRules"
              :error-messages="passwordError"
              clearable
              required
            />
            <cybex-btn type="submit" :disabled="!valid" middle major>{{ $t('button.show_phrase') }}</cybex-btn>
          </v-form>
        </v-flex>
        <!-- 显示助记词 -->
        <v-flex class="phrase" v-else>
          <div class="sub-title mb-2">{{ $t('info.phrase.hint_title') }}</div>
          <div class="key-content">
            <img src="~/assets/svg/ic-brainkey.svg">
            <span @click="copyPhrase">{{ phrase }}</span>
          </div>
          <cybex-btn major middle @click="togglePhrase(false)">{{ $t('info.phrase.btn_confirm') }}</cybex-btn>
        </v-flex>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import clipboard from "clipboard-polyfill";

export default {
  data() {
    return {
      blob: null,
      valid: false, // 是否可以查看助记词
      currentTab: 0,
      clickedDownload: false,
      password: "",
      passwordIsVisible: false,
      couldCheckphrase: false,
      passwordError: "",
      passwordRules: [value => !!value || this.$t("validation.pwd_required")],
      phrase:
        "pyruvic gosling zygite buzzies stipula smith baline loyalty glaury edea trinal jacinth tatty cauch achtel tana"
    };
  },
  computed: {
    ...mapGetters({
      info: "auth/info",
      islocked: "auth/islocked",
      isCloud: "auth/isCloud",
    }),
    filename() {
      let currentDate = moment().format("YYYYMMDD");
      return `Cybex_default_${currentDate}.bin`;
    },
    wallet() {
      return this.info ? this.info.wallet : null;
    },
    accountList() {
      if (!this.info) {
        return [];
      }
      let res = [];
      for (let user of this.info.users) {
        res.push({
          name: user.name,
          accessIsFull: user.full
        });
      }
      return res;
    },
    passwordIsValid() {
      return this.password !== "";
    },
    binFile() {
      return {
        name: this.filename,
        size: this.blob ? this.blob.size : ""
      };
    },
    tabItems() {
      let items = this.$route.query.register
        ? []
        : [
            {
              title: this.$t("tab_label.backup")
            },
            { title: this.$t("tab_label.phrase") }
          ];
      return items;
    }
  },
  head() {
    return {
      title: this.$t("title.backup")
    };
  },
  mounted() {
    // 检查是否有钱包文件 没有的话弹出提示
    if (this.info && this.info.wallet) {
      this.prepareDownloadFile();
    } else if (this.isCloud){
      this.$i18n.jumpTo('/exchange');
    }
  },
  watch: {
    password() {
      this.passwordError = [];
    }
  },
  methods: {
    copyPhrase() {
      clipboard.writeText(this.phrase);
      this.$message({
        message: this.$t("message.copied")
      });
    },
    checkHasBackup() {
      if (this.clickedDownload) {
        this.$i18n.jumpTo("/exchange");
      } else {
        return false;
      }
    },
    async prepareDownloadFile() {
      if (!this.wallet) {
        alert("没有钱包对象");
        return;
      }
      if (!this.blob) {
        const s = await this.wallet.exportBin();
        this.blob = new Blob([s], {
          type: "application/octet-stream; charset=us-ascii"
        });
      }
    },
    async download() {
      this.clickedDownload = true;
      if (!this.blob) {
        this.prepareDownloadFile();
      }
      this.$store.dispatch("auth/downloadBinFile", {});
    },
    /**
     * @param {Boolean} show
     */
    togglePhrase(show) {
      if (show && this.passwordIsValid) {
        // TODO 验证密码, 获取助记词
        try {
          this.phrase = this.info.wallet.getBrainKey(this.password);
          this.couldCheckphrase = true;
        } catch (e) {
          this.passwordError = this.$t("validation.pwd_wrong");
        }
      } else {
        this.couldCheckphrase = false;
        this.$store.commit("auth/setNotice", false);
      }
    }
  }
};
</script>

<style scoped lang="stylus">
@require '~assets/style/_vars/_colors';
@require '~assets/style/_fonts/_font_mixin';

.settings-tab {
  padding: 30px 0;

  .sub-title {
    f-cybex-style('heavy');
    color: $main.white;
  }

  // border
  .grey-border-top {
    border-top: 1px solid rgba($main.white, 0.08);
  }

  .grey-border-bottom {
    border-bottom: 1px solid rgba($main.white, 0.08);
  }

  // 声明
  .importance {
    padding: 30px 0;
    margin: 30px 0 0;
    color: rgba($main.orange);
    line-height: 1.71;
    f-cybex-style('heavy');

    // 图标
    .notice {
      background-image: linear-gradient(132deg, $main.hover, $main.orange);
      background-size: contain;
      border-radius: 50%;
      margin-right: 10px;

      &.ic-info:before {
        color: $main.dark;
        transform: scale(1.4);
      }
    }

    .content {
      color: rgba($main.orange, 0.8);
      line-height: 1.43;
      margin-top: 12px;
      f-cybex-style('medium');
      position: relative;
      padding-left: 19px;

      &:before {
        width: 2px;
        height: 70%;
        content: '';
        display: inline-block;
        position: absolute;
        background: rgba($main.orange, 0.5);
        left: 0;
        transform: translateY(15%);
      }
    }
  }

  // 用户列表
  .account-list {
    position: relative;
    width: 380px;
    margin-top: 30px;

    .to-exchange {
      cursor: pointer;
      color: $main.grey;
      font-size: 16px;
      position: absolute;
      left: calc(100% + 42px);
      bottom: 18px;
      width: 100px;

      .ic-arrow-back {
        position: relative;
        top: 2px;

        &:before {
          color: $main.grey;
          transform: rotate(180deg);
        }
      }
    }

    .account-list-content {
      margin-top: 17px;
      max-height: 200px;
      width: 360px;

      .account-list-item {
        height: 40px;
        line-height: 1.71;
        padding: 8px 0;

        .counter {
          color: rgba($main.white, 0.4);
          margin-right: 20px;
          max-width: 20px;
        }

        .ic-avatar {
          &.full {
            background-image: linear-gradient(132deg, $main.hover, $main.orange);
          }

          background: $main.grey;
          max-width: 18px;
          max-height: 18px;
          border-radius: 2px;
          margin-right: 8px;

          &:before {
            color: $main.dark;
          }
        }

        .ac-username {
          position: relative;
          bottom: 2px;
        }

        .account-access {
          color: $main.grey;
          flex: 0 1 auto !important;
          padding: 4px 7px;
          background: rgba($main.grey, 0.1);
          border-radius: 4px;
          line-height: 16px;

          &.full {
            color: $main.orange;
            background: rgba($main.orange, 0.1);
          }
        }
      }
    }

    .download-ctrl {
      cursor: pointer;
      margin-top: 30px;
      background-image: linear-gradient(98deg, $main.hover, $main.orange);
      border-radius: 4px;
      height: 56px;

      &:hover {
        background: $main.hover;
      }

      &:active {
        background: $main.orange;
      }

      > div {
        box-shadow: inset -1px 0 0 0 rgba(0, 0, 0, 0.12);
        height: 100%;
        padding: 6px 0 9px 24px;
      }

      .l1 {
        font-size: 16px;
        line-height: 1.5;
        f-cybex-style('heavy');
      }

      .l2 {
        font-size: 12px;
        color: rgba($main.white, 0.8);
        line-height: 1.33;

        .file-size {
          color: rgba($main.white, 0.5);
          margin-left: 19px;
        }
      }

      .ic-deposit {
        max-width: 56px;

        &:before {
          color: white;
        }
      }
    }
  }

  // 助记词tab
  .pwd {
    .pwd-input {
      max-width: 455px;
    }
  }

  .phrase {
    .key-content {
      line-height: 1.71;
      padding: 16px 0;
      margin-bottom: 16px;
      color: white;

      span {
        &:active, &:hover {
          cursor: copy;
          opacity: 0.8;
          user-select: all;
          -moz-user-select: all;
          -webkit-user-select: all;
          -ms-user-select: all;
        }
        &::selection {
          color: white;
          background-color: rgba($main.grey, 0.3)
        }
      }

      > img {
        margin-right: 16px;
      }

      > * {
        vertical-align: middle;
      }
    }
  }
}
</style>