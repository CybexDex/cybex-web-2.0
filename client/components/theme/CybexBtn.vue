<script>
/**
 * 封装Button @see https://app.zeplin.io/project/5bbc426d495b5d0a00ddc855/screen/5bbc7d1ec5588f18fae53f7b
 * -- 改装默认prop color 可用值 major | minor | minimal
 * -- 改装默认prop ripple true
 * -------以下是尺寸相关变量------
 * -- 新增props tiny 24px
 * -- 新增props small 32px
 * -- 新增props normal 40px
 * -- 新增props middle 48px
 * -- 新增props large 56px
 * -------以下是皮肤相关变量------
 * -- 新增props cybexDark
 * -- 新增props cybexLight  TODO: 支持亮色
 *
 * @see node_modules/vuetify/src/components/VBtn/VBtn.ts
 */
import VBtn from "vuetify/es5/components/VBtn/VBtn";

export default {
  extends: VBtn,
  props: {
    block: { type: Boolean, default: false },
    ripple: { type: Boolean, default: true },
    cybexDark: { type: Boolean, default: true },
    cybexLight: { type: Boolean, default: false },
    tiny: { type: Boolean, default: false },
    small: { type: Boolean, default: false },
    normal: { type: Boolean, default: false },
    middle: { type: Boolean, default: false },
    large: { type: Boolean, default: false },
    color: { type: String, default: "major" }
  },
  computed: {
    themeClasses() {
      if (this.cybexDark) {
        return { "theme--cybex-dark": true };
      } else if (this.cybexLight) {
        return { "theme--cybex-light": true };
      } else {
        return { "theme--cybex-dark": true };
      }
    },
    classes() {
      return {
        "v-btn": true,
        [this.activeClass]: this.isActive,
        // "theme--cybex-dark": this.cybexDark,
        // "theme--cybex-light": this.cybexLight,
        "tiny-size": this.tiny,
        "small-size": this.small,
        "normal-size": this.normal,
        "middle-size": this.middle,
        "large-size": this.large,
        "v-btn--absolute": this.absolute,
        "v-btn--block": this.block,
        "v-btn--bottom": this.bottom,
        "v-btn--disabled": this.disabled,
        "v-btn--flat": this.flat,
        "v-btn--floating": this.fab,
        "v-btn--fixed": this.fixed,
        "v-btn--icon": this.icon,
        "v-btn--large": this.large,
        "v-btn--left": this.left,
        "v-btn--loader": this.loading,
        "v-btn--outline": this.outline,
        "v-btn--depressed": (this.depressed && !this.flat) || this.outline,
        "v-btn--right": this.right,
        "v-btn--round": this.round,
        "v-btn--router": this.to,
        "v-btn--small": this.small,
        "v-btn--top": this.top,
        ...this.themeClasses
      };
    }
  }
};
</script>