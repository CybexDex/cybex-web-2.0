<template>
  <v-app dark class="cybex main-layout">
    <!-- top navigator -->
    <appNav/>
    <!-- end top navigator -->
    <!-- content start -->
    <v-content>
      <perfect-scrollbar :options="{swipeEasing: false}">
        <v-container fluid pa-0 fill-height>
          <transition name="layout" mode="out-in">
            <nuxt/>
          </transition>
        </v-container>
      </perfect-scrollbar>
    </v-content>
    <!-- content end -->
    <!-- footer start -->
    <appFooter :float="isLogin" />
    <!-- footer end -->
  </v-app>
</template>

<script>
export default {
  components: {
    appNav: () => import("~/components/AppNavigation.vue"),
    appFooter: () => import("~/components/AppFooter.vue")
  },
  computed: {
    // 登录时悬浮显示页脚
    isLogin() {
      return this.$route.name === "lang";
    }
  }
};
</script>


