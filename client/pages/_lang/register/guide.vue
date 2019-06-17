<template>
  <div class="create-wrapper text-center">
    <guide-logo/>
    <h3 class="text-center">{{ $t('sub_title.congratulation') }}</h3>
    <p>{{ $t('info.start_exchange') }}</p>
    <v-btn @click="jumpTo('/exchange')">{{ $t('button.exchange') }}&nbsp;<v-icon>ic-arrow-back</v-icon></v-btn>
  </div>
</template>

<style lang="stylus" scoped>
@require '~assets/style/_fonts/_font_mixin'
@require '~assets/style/_vars/_colors'
.create-wrapper
  width: 100%;
  height: 480px;
  h3
    margin-top: 20px;
    font-size: 20px;
    f-cybex-style('black');
    line-height: 1.6;
  p
    margin-top: 17px;
    opacity: 0.8;
    font-size: 14px;
    f-cybex-style(medium);
    line-height: 1.71;
  .v-btn
    margin-top: 24px;
    background: linear-gradient(98deg, #ffc478, #ff9143);
    width: 167px;
    height: 48px;
    border-radius: 4px;
    .v-btn__content
      font-size: 24px;
      .v-icon
        position: absolute;
        left: 130px;
        color: white !important;
        transform:rotate(180deg);
</style>

<script>
import utils from '~/components/mixins/utils'

export default {
  mixins: [ utils ],
  components: {
    GuideLogo: () => import("~/components/GuideLogo.vue")
  },
  head() {
    return {
      title: this.$t("title.register")
    }
  }
}
</script>