<template>
  <v-app dark class="cybex transfer-layout">
    <!-- top navigator -->
    <appNav/>
    <!-- end top navigator -->
    <!-- content start -->
    <perfect-scrollbar :options="{swipeEasing: false}">
      <div>
        <v-content class="pb-5 min-width">
          <v-container fluid class="pa-0">
            <nuxt v-if="inited"/>
          </v-container>
        </v-content>
      </div>
    </perfect-scrollbar>
    <!-- content end -->
    <!-- footer start -->
    <appFooter :float="false"/>
    <!-- footer end -->
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    appNav: () => import("~/components/AppNavigation.vue"),
    appFooter: () => import("~/components/AppFooter.vue")
  },
  computed: {
    ...mapGetters({
      username: "auth/username",
      inited: "user/inited"
    })
  },
  methods: {
    ...mapActions({
      loadAssets: "user/loadAssets",
      updateCoinMap: "user/updateCoinMap"
    })
  },
  watch: {
    async username(val) {
      if (!val) {
        return;
      }
      await this.loadAssets(this.username);
      await this.updateCoinMap();
    }
  },
  async mounted() {
    // await this.initBasics()
    await this.loadAssets(this.username);
    await this.updateCoinMap();
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.transfer-layout .container {
  max-width: 1280px !important;
}

.transfer-form-wrapper {
  padding: 27px 0px 33px 32px;
  font-size: 12px;

  .v-form {
    width: 100%;
  }

  .form-field {
    margin-bottom: 8px;
  }

  .error-msg {
    color: $main.error !important;
    padding: 8px 0 12px;
    min-height: 32px;
    margin: 0;
  }

  .forbid-info {
    margin-top: 80px;
    margin-bottom: 80px;
    text-align: center;
    color: $main.orange;
    width: 100%;
  }

  .show-fee {
    color: rgba($main.white, 0.5);

    .fee-label {
      color: rgba($main.white, 0.5);

      &.large {
        font-size: 14px;
        color: rgba($main.white, 0.8);
      }
    }

    .fee-amount {
      f-cybex-style('heavy');
      color: $main.grey;

      &.large {
        font-size: 14px;
        color: $main.white;
      }
    }
  }
}
</style>
