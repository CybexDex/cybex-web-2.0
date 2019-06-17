/**
 * UI plugin vuetify
 * @see https://vuetifyjs.com/zh-Hans/
 */
// import 'material-design-icons-iconfont/dist/material-design-icons.css'
// import '@fortawesome/fontawesome-free/css/all.css'
import Vue from 'vue'
import {
  Vuetify,
  VApp,
  VMenu,
  VTabs,
  VNavigationDrawer,
  VFooter,
  VForm,
  VTextField,
  VTextarea,
  VList,
  VBtn,
  VIcon,
  VGrid,
  VCarousel,
  VDivider,
  VCheckbox,
  VHover,
  VTooltip,
  VChip,
  VRating,
  VSnackbar,
  VDataTable,
  VToolbar,
  VDialog,
  VAutocomplete,
  VDatePicker,
  VCard,
  VSelect,
  VPagination,
  VImg,
  VSwitch
} from 'vuetify'

import { CybexCheckbox, CybexTextField, CybexSwitch, CybexBtn, CybexFileUpload } from '~/components/theme';
import AssetPairs from "~/components/AssetPairs.vue";

import { Resize, Ripple, Scrolling } from 'vuetify/es5/directives';

// required components
const CYBEX_COMPONENTS = {
  VApp,
  VMenu,
  VTabs,
  VNavigationDrawer,
  VFooter,
  VForm,
  VTextField,
  VTextarea,
  VList,
  VBtn,
  VIcon,
  VGrid,
  VCarousel,
  VDivider,
  VCheckbox,
  VHover,
  VTooltip,
  VChip,
  VRating,
  VSnackbar,
  VDataTable,
  VToolbar,
  VDialog,
  VAutocomplete,
  VDatePicker,
  VSelect,
  VCard,
  VPagination,
  VImg,
  VSwitch,

  CybexCheckbox,
  CybexTextField,
  CybexSwitch,
  CybexBtn,
  CybexFileUpload,
  AssetPairs
}

const CYBEX_DIRECTIVES = {
  Ripple,
  Resize,
  Scrolling
}

const MY_ICONS = {
  clear: 'ic-cancel',
  dropdown: 'ic-arrow_drop_down',
  next: 'ic-chevron_right',
  prev: 'ic-chevron_left'
}

Vue.use(Vuetify, {
  components: CYBEX_COMPONENTS,
  directives: CYBEX_DIRECTIVES,
  // iconfont: 'fa',
  icons: MY_ICONS,
  options: {
    minifyTheme: function (css) {
      return process.env.NODE_ENV === 'production'
        ? css.replace(/[\s|\r\n|\r|\n]/g, '')
        : css
    }
  }
});

