<template>
  <v-flex class="content-container-inner text-xs-center" align-center>
    <div class="success-logo">
      <GuideLogo width="112" height="110"/>
    </div>
    <v-flex>
      <template v-if="page === 'import'">
        <div class="success-hint" v-html="$t('wallet.import_success_hint')" />
        <div
          class="setting-desc"
        >{{ $t('wallet.import_success_desc') }}</div>
      </template>
      <template v-else-if="page === 'restore'">
        <div class="success-hint" v-html="$t('wallet.restore_success_hint')" />
        <div
          class="setting-desc"
        >{{ $t('wallet.restore_success_desc') }}</div>
      </template>
    </v-flex>
    <cybex-btn large major @click="backupBinFile">
      {{ $t('button.backup') }}
      <v-icon class="arrow pr-1">ic-arrow-back</v-icon>
    </cybex-btn>
  </v-flex>
</template>

<script>
export default {
  props: {
    page: {
      type: String,
      default: "import"
    }
  },
  components: {
    GuideLogo: () => import("~/components/GuideLogo.vue")
  },
  methods: {
    backupBinFile() {
      this.$router.push(this.$i18n.path('/settings/backup'));
    }
  }
};
</script>

<style scoped lang="stylus">
@require '~assets/style/_vars/_colors';
@require '~assets/style/_fonts/_font_mixin';

.arrow {
  transform: rotate(180deg);
}

.import-key-input {
  max-width: 776px;
}

.setting-desc {
  margin: 20px 0 0;
  padding-bottom: 30px;
}

.success-logo {
  margin-bottom: 20px;
}

.success-hint {
  font-size: 20px;
  font-weight: 900;
  line-height: 1.6;
  color: $main.white;
  f-cybex-style('heavy');
}
</style>