<template>
  <v-tooltip content-class="generated-tip" :nudge-right="offset" bottom>
    <template slot="activator">
      <slot name="hooker">
        <v-icon size="14" @click.native="disableCheck($event)" class="notice-icon">ic-help</v-icon>
      </slot>
    </template>
    <span v-html="content"/>
  </v-tooltip>
</template>

<style lang="stylus">
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

.generated-tip {
  width: 262px;
  padding: 12px 16px;
  background-color: rgba(17, 22, 33, 0.92);
  opacity: color
  font-size: 14px;
  f-cybex-style(medium);
  line-height: 1.29;
}
</style>

<script>
export default {
  props: {
    content: {
      type: String,
      required: true
    },
    offset: {
      type: Number,
      default: 120
    }
  },
  methods: {
    disableCheck(event) {
      event.stopPropagation();
      // event.preventDefault();
    }
  }
};
</script>

