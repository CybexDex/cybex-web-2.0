<template>
  <v-dialog v-model="isShowVersion" persistent content-class="version-panel" width="464">
    <v-icon class="btn-close" @click="isShowVersion=false">ic-close</v-icon>
    <div class="content" v-html="$t('info.version_notice')"/>
    <a class="link_to_old" @click="open(oldUrl)">{{ oldUrl }}</a>
    <cybex-checkbox
      small
      class="show-check mt-4"
      v-model="neverShowVersion"
      :label="$t('checkbox_label.never_show_again')"
    />
  </v-dialog>
</template>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.version-panel {
  background: $main.lead;

  .cybex-checkbox {
    float: right;
  }
  .content {
    margin-top: 25px;
  }
  span, p {
    font-size: 12px;
    width: 400px;
    line-height: 1.83;
    color: rgba($main.white, 0.8);
  }

  .link_to_old {
    font-size: 12px;
    color: $main.orange;
    text-decoration: underline;
  }
}
</style>

<script>
import { mapGetters } from "vuex";
import config from "~/lib/config/config.js";

export default {
  data() {
    return {
      oldUrl: config.links.oldSite
    };
  },
  computed: {
    ...mapGetters({
      username: "auth/username",
      showVersion: "showVersion",
      versionFlag: "user/versionFlag"
    }),
    isShowVersion: {
      get() {
        return this.showVersion;
      },
      set(value) {
        this.$toggleVersion();
      }
    },
    neverShowVersion: {
      get() {
        return this.versionFlag;
      },
      set(value) {
        this.$store.commit("user/SET_VERSION_FLAG", {
          username: this.username,
          flag: value
        });
      }
    }
  },
  methods: {
    open(url) {
      window.open(url);
    }
  }
};
</script>

