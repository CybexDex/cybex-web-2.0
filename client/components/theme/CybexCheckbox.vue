
<script>
/**
 * 封装VCheckbox默认选项, 样式
 * -- 指定on-icon和off-icon图标
 * -- 默认取消Ripple效果
 * -- 新增可选props
 * 
 * small  Boolean 图标大小为16 (默认24)
 * middle Boolean 图标大小为20 (默认24)
 * large Boolean 图标大小为24
 * prerender-icons Array ["ic-check_box_active"] 需要预加载的svg集合
 * align-items-center 行高align items center
 * 
 */
import VCheckbox from "vuetify/es5/components/VCheckbox/VCheckbox";
import VIcon from "vuetify/es5/components/VIcon/VIcon";
export default {
  name: "CybexCheckbox",
  extends: VCheckbox,
  props: {
    ripple: { type: Boolean, default: false } ,
    small: { type: Boolean, default: false },
    middle: { type: Boolean, default: false },
    large: { type: Boolean, default: false },
    prerenderIcons: { type: Array, default: () => ["ic-check_box_active"] },
    onIcon: { type: String, default: "ic-check_box_active" },
    offIcon: { type: String, default: "ic-check_box" },
    alignItemsCenter: { type: Boolean, default: false }
  },
  computed: {
    classes() {
      return {
        "v-input--selection-controls": false,
        "v-input--checkbox": true,
        "cybex-checkbox": true,
        "small-size": this.small,
        "middle-size": this.middle,
        "large-size": this.large,
        "align-items-center": this.alignItemsCenter
      };
    },
    computedIcon() {
      if (this.inputIndeterminate) {
        return this.indeterminateIcon;
      } else if (this.isActive) {
        let onIcon = this.onIcon;
        if (this.disabled) {
          onIcon = "ic-check_box_active_disabled";
        }
        if (this.small) {
          onIcon = "ic-check_box_active small-size";
        }
        if (this.middle) {
          onIcon = "ic-check_box_active middle-size";
        }
        return onIcon;
      } else {
        return this.offIcon;
      }
    }
  },
  methods: {
    /**
     * overwrite default checkbox html
     * add cybex class
     * @see node_modules/vuetify/src/components/VCheckbox/VCheckbox.js
     */
    genCheckbox() {
      let cls = this.small ? 'small-size' : '';
      if (this.middle) {
        cls = 'middle-size';
      }
      return this.$createElement(
        "div",
        {
          staticClass: "v-input--selection-controls__input " + cls
        },
        [
          this.genInput("checkbox", {
            ...this.$attrs,
            "class": cls,
            "aria-checked": this.inputIndeterminate
              ? "mixed"
              : this.isActive.toString()
          }),
          this.genRipple(this.setTextColor(this.computedColor)),
          this.$createElement(
            VIcon,
            this.setTextColor(this.computedColor, {
              props: {
                dark: this.dark,
                light: this.light,
                size: this.small ? 16 : (this.middle ? 20 : 24)
              }
            }),
            this.computedIcon
          )
        ]
      );
    },
    // 对于用background: url()方式加载的svg 预加载svg
    genHiddenSVG() {
      let r = [];
      if (this.prerenderIcons.length) {
        for (let i of this.prerenderIcons) {
          r.push(
            this.$createElement(
              VIcon,
              {
                style: "display: none"
              },
              i
            )
          );
        }
      }
      return r;
    },
    genDefaultSlot() {
      return [this.genHiddenSVG(), this.genCheckbox(), this.genLabel()];
    }
  }
};
</script>