<template>
  <v-app dark class="cybex history">
    <!-- top navigator -->
    <appNav/>
    <!-- end top navigator -->
    <!-- content start -->
    <perfect-scrollbar :options="{swipeEasing: false}">
      <v-content class="min-width">
        <v-container fluid class="pa-0">
          <nuxt/>
        </v-container>
      </v-content>
    </perfect-scrollbar>
    <!-- content end -->
    <!-- footer start -->
    <appFooter :float="islocked"/>
    <!-- footer end -->
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  components: {
    appNav: () => import("~/components/AppNavigation.vue"),
    appFooter: () => import("~/components/AppFooter.vue")
  },
  computed: {
    ...mapGetters({
      islocked: "auth/islocked"
    })
  }
};
</script>

