<template>
  <div class="portrait-wrapper">
    <div v-if="notice" class="notice-circle" />
    <div class="insider" :class="{'small': size < 64, 'hidden': !isVIP}" /> 
    <!-- VIP用户显示彩虹犀牛头像 -->
    <canvas :class="{'hidden': isVIP, 'small': size < 64}" :width="!isVIP ? size : 0" :height="!isVIP ? size : 0" ref="canvas"/>
  </div>
</template>

<script>
import jdenticon from "jdenticon";
import sha256 from "sha256";
import insider from '~/lib/insider.json';
import { indexOf, keys } from 'lodash';

export default {
  props: {
    username: {
      type: String,
      default: ""
    },
    size: {
      type: String,
      default: "64"
    },
    notice: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isVIP: false
    }
  },
  watch: {
    username(val) { 
      this.isVIP = indexOf(keys(insider), val) !== -1;
      this.draw();
    }
  },
  methods: {
    draw() {
      // check whether use rainbow profile image
      if (!this.isVIP) {
        const canvas = this.$refs.canvas;
        if (canvas && canvas.getContext) {
          const context = canvas.getContext("2d");
          if (context) {
            this.$nextTick(() => {
              jdenticon.drawIcon(context, sha256(this.username), this.size);
            })
          }
        }
      }
     
    }
  },
  mounted() {
    this.isVIP = indexOf(keys(insider), this.username) !== -1;
    this.draw();
  }
};
</script>

<style scoped lang="stylus">

.portrait-wrapper {
  position: relative;
  .notice-circle {
    width: 14px;
    height: 14px;
    position: absolute;
    right: -2px;
    top: -2px;
    border-radius: 50%;
    background-color: #d7333d;
    border: solid 2px #1b2230;
  }
  .insider {
    background: url('~assets/images/rainbow_lighter.png') no-repeat;
    width: 32px;
    height: 32px;
    background-size: contain;
    transform: rotateY(180deg);
    &.small {
      width:  16px;
      height: 16px
    }
  }
}
canvas {
  &.hidden {
    width: 0 !important;
    height : 0 !important;
  }
  width: 32px;
  height: 32px;
  line-height: 64px;
  border-radius: 16px;

  &.small {
    width: 16px;
    height: 16px;
  }
  &.notice:before {
    content: '';
    display: block;
  }
}
</style>