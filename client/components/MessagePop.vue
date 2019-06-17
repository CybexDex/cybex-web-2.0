<template>
  <v-snackbar
    class="nav-global"
    v-model="showCopied"
    :timeout="2000"
    top
  >
    <v-icon>ic-cancel</v-icon>{{ message }}
  </v-snackbar>
</template>


<style lang="stylus">
.nav-global
  .v-snack__wrapper
    background-color: #212939;
  .v-snack__content
    display: initial;
    justify-content: initial;
    text-align: center;
    width: 377px !important;
    height: 80px !important;
    line-height: 52px;
    color: red;
    .v-icon
      font-size: 1.6em;
      line-height: 18px;
      margin-right: 8px;
</style>

