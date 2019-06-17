<template>
  <v-footer class="footer-wrap" :fixed="fixed" :height="64" :app="float">
    <v-toolbar class="nav-footer" :height="64">
      <div class="left-footer">
        <a
          v-for="(item, index) in items.left"
          class="mr-4"
          :key="index"
          @click="open(item.url)"
        >{{ $t(`info.${item.text}`) }}</a>
      </div>
      <v-spacer/>
      <div class="right-footer">
        <a
          v-for="(item, index) in items.right"
          class="ml-4"
          :key="index"
          @click="open(item.url)"
        >
          <v-icon>{{ item.icon }}</v-icon>
        </a>
      </div>
    </v-toolbar>
  </v-footer>
</template>

<script>
import { mapGetters } from 'vuex'
import config from "~/lib/config/config.js"
import PerfectScrollbar from 'perfect-scrollbar';

export default {
  name: "AppFooter",
  props: {
    float: {
      type: Boolean,
      default: true
    },
    fixed: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    ...mapGetters({
      locale: 'i18n/shortcut'
    })
  },
  data() {
    return {
      items: {
        left: [
          {
            text: "about",
            url: config.links.about
          },
          {
            text: "feedback",
            url: config.links.feedback
          },
          {
            text: "asset_intro",
            url: config.links.assetIntro
          },
          {
            text: "old_site_fee",
            url: config.links.oldSiteFee
          },
          {
            text: "old_site",
            url: config.links.oldSite
          },
          {
            text: "go_explorer",
            url: config.links.cybexlive
          }
        ],
        right: [
          {
            icon: "ic-telegram",
            url: config.links.telegram
          },
          {
            icon: "ic-medium",
            url: config.links.medium
          },
          {
            icon: "ic-instagram_new",
            url: config.links.instagram
          },
          {
            icon: "ic-twitter",
            url: config.links.twitter
          },
          {
            icon: "ic-facebook",
            url: config.links.facebook
          }
        ]
      }
    };
  },
  methods: {
    open (obj) {
      if (typeof obj === 'string') {
        window.open(obj)
      } else {
        window.open(obj[this.locale])
      }
    }
  },
  mounted () {
    new PerfectScrollbar('.nav-footer')
  }
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin'
@require '~assets/style/_vars/_colors'

.theme--dark.v-footer.footer-wrap {
  &, .nav-footer {
    background: $main.lead;
    overflow-x: hidden;
  }

  .v-toolbar__content {
    background: $main.lead;
    width: 100%;
    min-width: 1280px;
    word-break: keep-all;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
  }

  a:hover {
    &, .v-icon::before {
      color: $main.lilac !important;
    }
  }

  .left-footer {
    a {
      font-size: 12px;
      line-height: 2;
      color: rgba($main.grey, 0.8);
      f-cybex-style('black');
    }
  }

  .right-footer {
    .v-icon {
      opacity: 0.8;
      color: $main.grey;
      font-size: 24px;
    }
  }
}
</style>