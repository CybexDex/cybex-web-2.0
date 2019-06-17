<template>
  <v-flex class="error-wrapper">
    <v-flex :class="nofoundClass">
      <h1 v-if="showOneOrTwo">{{ $t('info.no_found1_1') }}</h1>
      <h1 v-else>{{ $t('info.no_found1_2') }}</h1>
      <p v-if="isErrorPage">{{ $t('info.some_error') }}</p>
      <p v-else class="mt-2">{{ $t('info.no_found2') }}</p>
      <v-btn
        @click="onHomeClicked"
        class="mt-4"
      >{{ isErrorPage ? $t('button.go_refresh') : $t('button.go_home') }}</v-btn>
    </v-flex>
  </v-flex>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: () => {
        {
        }
      }
    }
  },
  data() {
    return {
      showOneOrTwo: false
    };
  },
  computed: {
    nofoundClass() {
      return {
        "not-found": true,
        "bg-1": this.showOneOrTwo,
        "bg-2": !this.showOneOrTwo,
        "is-error": this.isErrorPage
      };
    },
    isErrorPage() {
      console.log("this.error", this.error);
      return this.error.statusCode !== 404;
    }
  },
  methods: {
    onHomeClicked() {
      if (this.isErrorPage) {
        window.location.reload();
      } else {
        this.$router.replace(this.$i18n.path("/"));
      }
    }
  },
  mounted() {
    const random = Math.random();
    this.showOneOrTwo = random > 0.5;
  }
};
</script>

<style lang="stylus" scoped>
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.error-wrapper {
  height: 100%;
  align-items: center;
  display: flex;
  justify-content: space-around;
}

.not-found {
  width: 836px;
  height: 450px;
  background-repeat: no-repeat !important;
  background-size: cover !important;
  // background-attachment: fixed !important;
  flex: 0 1 auto;

  &.is-error {
    margin-top: 80px;
    padding-top: 20px !important;

    h1 {
      margin-top: 42px !important;
    }
  }

  &.bg-1 {
    background: url('~assets/images/404-2.png');
    text-align: left;
    padding: 200px 0 0 80px;

    h1 {
      font-size: 74px;
      f-cybex-style('black');
      color: $main.grey;
    }

    p {
      font-size: 14px;
      f-cybex-style('black');
      line-height: 1.71;
      color: rgba($main.white, 0.8);
    }

    .v-btn {
      margin-left: 0;
    }
  }

  &.bg-2 {
    background: url('~assets/images/404-1.png');
    text-align: center;
    padding-top: 56px;
    h1 {
      font-size: 74px;
      f-cybex-style('black');
      color: $main.grey;
    }

    p {
      font-size: 14px;
      f-cybex-style('black');
      line-height: 1.71;
      color: rgba($main.white, 0.8);
    }
  }

  .theme--dark.v-btn {
    background-image: linear-gradient(96deg, #ffc478, #ff9143);
  }
}
</style>
