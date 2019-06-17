<script>
import VTextField from "vuetify/es5/components/VTextField/VTextField";
import VInput from "vuetify/es5/components/VInput/VInput";
import VTextarea from "vuetify/es5/components/VTextarea/VTextarea";
import VIcon from "vuetify/es5/components/VIcon/VIcon";
/**
 * 封装VTextField默认选项
 * 改写Solo的label显示方式
 * 改写Outline的input大小label浮动数值
 *
 * -- 默认改写类型 solo | outline
 * -- 默认改写颜色 color 使用transparent作为默认值
 * -- 默认改写clearIcon 使用自定义图标 ic-cancel
 *
 * -- 新增props multiText     是否使用textarea
 * -- 新增props noMessage     是否隐藏v-messages不显示任何错误提示
 * -------以下是尺寸相关变量------
 * -- 新增props tiny 20px
 * -- 新增props small 32px
 * -- 新增props middle 40px
 * -- 新增props large 56px
 * -------以下是皮肤相关变量------
 * -- 新增props cybexDark
 * -- 新增props cybexLight    TODO: 支持亮色
 * -------以下是action图标和对应方法变量-------
 * -- 新增props actionIcon    action 图标
 * -- 新增props actionIconCb  action callback
 * -- 新增props copyIcon      复制 图标
 * -- 新增props copyIconCb    复制方法 图标点击callback
 *
 *
 *
 * @see node_modules/vuetify/src/components/VTextField/VTextField.js
 *
 */
export default {
  extends: VTextField,
  props: {
    color: { type: String, default: "transparent" }, // 覆写default primary颜色
    clearIcon: { type: String, default: "ic-cancel" },
    solo: { type: Boolean, default: true },
    cybexDark: { type: Boolean, default: true },
    cybexLight: { type: Boolean, default: false },
    tiny: { type: Boolean, default: false },
    small: { type: Boolean, default: false },
    middle: { type: Boolean, default: false },
    large: { type: Boolean, default: false },
    copyIcon: { type: String, default: "" },
    copyIconCb: { type: Function, default: () => {} },
    actionIcon: { type: String, default: "" },
    actionIconCb: { type: Function, default: () => {} },
    multiText: { type: Boolean, default: false },
    noMessage: { type: Boolean, default: false },
    appendLabel: { type: String, default: "" },
    rows: {
      type: [Number, String],
      default: 5,
      validator: v => !isNaN(parseInt(v, 10))
    }
  },
  computed: {
    classes() {
      return {
        "v-text-field": true,
        "theme--cybex-dark": this.cybexDark,
        "theme--cybex-light": this.cybexLight,
        "v-text-field--fixed-label": this.label && this.isSolo,
        "small-size": this.small,
        "tiny-size": this.tiny,
        "middle-size": this.middle,
        "large-size": this.large,
        "v-text-field--no-message": this.noMessage,
        "v-text-field--action-custom":
          this.actionIcon !== "" || this.$slots["action"],
        "v-text-field--action-copy": this.copyIcon !== "",
        "v-text-field--full-width": this.fullWidth,
        "v-text-field--prefix": this.prefix,
        "v-text-field--single-line": this.isSingle,
        "v-text-field--solo": this.isSolo,
        "v-text-field--solo-inverted": this.soloInverted,
        "v-text-field--solo-flat": this.flat,
        "v-text-field--box": this.box,
        "v-text-field--enclosed": this.isEnclosed,
        "v-text-field--reverse": this.reverse,
        "v-text-field--outline": this.hasOutline,
        "v-text-field--placeholder": this.placeholder,
        "v-text-field-is-multiple": this.multiText,
      };
    }
  },
  methods: {
    genFixedLabelSlot() {
      const slot = [];
      if (this.$slots["label"]) {
        slot.push(this.$slots["label"]);
      } else if (this.label && this.isSolo) {
        slot.push(this.genFixedLabel());
      }
      if (this.$slots["append-label"]) {
        slot.push(
          this.$createElement(
            "div",
            {
              staticClass: "fixed-append-label"
            },
            this.$slots["append-label"]
          )
        );
      } else if (this.appendLabel && this.isSolo) {
        slot.push(this.genAppendLabel());
      }
      return this.$createElement(
        "div",
        {
          staticClass: "fixed-label-wrapper"
        },
        slot
      );
      // return slot;
    },
    genFixedLabel() {
      if (this.label == "" || !this.isSolo) return "";
      // 固定label
      return this.$createElement(
        "div",
        {
          staticClass: "fixed-label"
        },
        this.label
      );
    },
    genAppendLabel() {
      if (this.appendLabel == "" || !this.isSolo) return "";
      return this.$createElement(
        "div",
        {
          staticClass: "fixed-append-label"
        },
        this.appendLabel
      );
    },
    genActionSlot() {
      const slot = [];
      if (this.$slots["action"]) {
        slot.push(this.$slots["action"]);
      } else if (this.actionIcon || this.copyIcon) {
        slot.push(this.genActionIcon());
      }
      return this.genSlot("action", "inner", slot);
    },
    genActionIcon() {
      const eventName = "click:action";
      if (this.copyIcon !== "") {
        const cb = this.copyIconCb;
        const data = {
          staticClass: `ma-0 pa-0 ${this.copyIcon}`,
          key: this.copyIcon,
          props: {
            disabled: this.disabled
          },
          on: !(this.$listeners[eventName] || cb)
            ? null
            : {
                click: e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.$emit(eventName, e);
                  this.copyIconCb && this.copyIconCb(this.value);
                },
                // Container has mouseup event that will
                // trigger menu open if enclosed
                mouseup: e => {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
        };
        return this.$createElement(VIcon, data);
      } else if (this.actionIcon !== "") {
        const cb = this.actionIconCb;
        const data = {
          staticClass: `ma-0 pa-0 ${this.actionIcon}`,
          key: this.actionIcon,
          props: {
            disabled: this.disabled
          },
          on: !(this.$listeners[eventName] || cb)
            ? null
            : {
                click: e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.$emit(eventName, e);
                  cb && cb(e);
                },
                // Container has mouseup event that will
                // trigger menu open if enclosed
                mouseup: e => {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
        };
        return this.$createElement(VIcon, data);
      }
    },
    genDefaultSlot() {
      return [
        this.genFixedLabelSlot(),
        this.genTextFieldSlot(),
        this.genClearIcon(),
        this.genIconSlot(),
        this.genProgress()
      ];
    },
    genInput() {
      let input = VTextField.methods.genInput.call(this);
      if (this.multiText) {
        input = VTextarea.methods.genInput.call(this);
      }
      return input;
    },
    genInputSlot() {
      const input = VInput.methods.genInputSlot.call(this);

      const prepend = this.genPrependInnerSlot();
      prepend && input.children.unshift(prepend);

      // action
      const action = this.genActionSlot();
      action && input.children.push(action);
      return input;
    },
    genTextFieldSlot() {
      let cls = "v-text-field__slot";
      if (this.small) {
        cls += " small-size";
      } else if (this.middle) {
        cls += " middle-size";
      } else {
        cls += " large-size";
      }
      return this.$createElement(
        "div",
        {
          staticClass: cls
        },
        [
          !this.isSolo && this.label !== "" ? this.genLabel() : null,
          this.prefix ? this.genAffix("prefix") : null,
          this.genInput(),
          this.suffix ? this.genAffix("suffix") : null
        ]
      );
    }
  }
};
</script>
