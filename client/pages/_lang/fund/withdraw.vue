<template>
  <transfer-selector fundtype="withdraw">
    <nuxt-child />
  </transfer-selector>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  layout: 'transfer',
  components: {
    HistoryList: () => import("~/components/HistoryList.vue"),
    TransferSelector: () => import("~/components/TransferSelector.vue")
  }
}
</script>