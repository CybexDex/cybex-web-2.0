
<script>
import VSwitch from "vuetify/es5/components/VSwitch/VSwitch";
export default {
  props: {
    ripple: { type: Boolean, default: false },
    color: { type: String, default: "#ff9134" }
  },
  extends: VSwitch
};
</script>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.v-input--switch {
  .v-input--switch__thumb {
    background: $main.grey;
    box-shadow: none;
  }

  .v-input--switch__track {
    width: 32px;
    height: 14px;
    border-radius: 12px;
    background-color: rgba(120, 129, 154, 0.35);
  }

  .v-label {
    color: $main.white80;
    f-cybex-style('heavy');
    font-size: 14px;
    line-height: 1.6;
  }

  &.v-input--is-label-active {
    .v-input--switch__thumb {
      background: $gradients.goldex;
    }
    .v-input--switch__track {
      background-color: rgba(254, 155, 85, 0.35);
    }
  }
  .v-messages {
    display: none;
  }
}
</style>
