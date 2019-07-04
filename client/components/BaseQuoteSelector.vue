<template>
  <v-flex class="filter-pairs c-white-30" d-flex row align-center>
    <label class="c-white-30 mr-2">{{ $t(label) }}:</label>
    <v-flex>
      <v-autocomplete
        dark
        class="pairs-items text-xs-right small-size"
        :items.sync="quoteItems"
        :append-icon="'ic-arrow_drop_down'"
        v-model="selectedQuote"
        cache-items
        flat
        hide-no-data
        hide-details
        height="24"
        solo
        :menu-props="{'maxWidth': '120', 'contentClass': 'ps-dropdown ps-dropdown-quote', 'nudgeBottom': '12'}"
      />
    </v-flex>
    <span>/</span>
    <v-flex>
      <v-autocomplete
        dark 
        class="pairs-items small-size"
        :items.sync="baseItems"
        height="24"
        :append-icon="'ic-arrow_drop_down'"
        v-model="selectedBase"
        cache-items
        flat
        hide-no-data
        hide-details
        solo
        :menu-props="{'maxWidth': '120', 'contentClass': 'ps-dropdown ps-dropdown-base', 'nudgeBottom': '12'}"
      />
    </v-flex>
  </v-flex>
</template>

<script>
import { mapGetters } from "vuex";
import { indexOf, mapValues, map, keys, sortBy } from "lodash";
import utils from "~/components/mixins/utils";
import PerfectScrollbar from "perfect-scrollbar";

export default {
  props: {
    label: {
      type: String,
      default: "exchange.order-table.filter.pairs"
    },
    selectedPair: {
      type: Object,
      default: () => {}
    },
    sortByLetter: {
      type: Boolean,
      default: true
    }
  },
  model: {
    prop: "selectedPair",
    event: "update-pair"
  },
  data() {
    return {
      showBaseDropdown: false,
      showQuoteDropdown: false,
      inputVal: "",
      baseItems: [],
      quoteItems: []
    };
  },
  watch: {
    selectedQuote: function(selectedQuote) {
      let setted = false;
      this.baseItems.forEach((v, index) => {
        const enabled = this.couldBeEnabled(v.children, selectedQuote);
        if (enabled && !setted) {
          this.selectedBase = v.value;
          setted = true;
        }
        this.$set(this.baseItems[index], "disabled", !enabled);
      });
    }
  },
  computed: {
    ...mapGetters({
      bases: "user/bases",
      coinMap: "user/coins",
      coinsInvert: "user/coinsInvert"
    }),
    selectedBase: {
      get: function() {
        let v = this.selectedPair.hasOwnProperty("base_id")
          ? this.selectedPair.base_id
          : "";
        return v;
      },
      set: function(v) {
        this.$emit("update-pair", { base_id: v, quote_id: this.selectedQuote });
      }
    },
    selectedQuote: {
      get: function() {
        let v = this.selectedPair.hasOwnProperty("quote_id")
          ? this.selectedPair.quote_id
          : "";
        return v;
      },
      set: function(v) {
        this.$emit("update-pair", {
          base_id: "",
          quote_id: v
        });
      }
    }
  },
  methods: {
    couldBeEnabled(search, selectedQuote) {
      // console.log('search', search, selectedQuote, indexOf(search, selectedQuote));
      return indexOf(search, selectedQuote) > -1;
    },
    checkOption(event) {
      event.preventDefault();
    },
    getBaseItems: function() {
      let arr = [];
      map(this.bases, v => {
        arr.push({
          value: v.base,
          text: this.coinName(v.base, this.coinMap),
          disabled: !this.couldBeEnabled(v.data, this.selectedQuote),
          children: v.data
        });
      });
      if (this.sortByLetter) {
        arr = sortBy(arr, ["text", "value"]);
      }
      arr.unshift({
        value: "",
        text: this.$t("exchange.content.all"),
        disabled: !this.couldBeEnabled(["all"], this.selectedQuote),
        children: ["all"]
      });
      return arr;
    },
    getQuoteItems: function() {
      let arr = [];
      let quotes = mapValues(this.bases, v => {
        if (v.data) {
          map(v.data, quoteV => {
            arr.push({
              parent: v.base,
              value: quoteV,
              text: this.coinName(quoteV, this.coinMap)
            });
          });
        }
      });
      if (this.sortByLetter) {
        arr = sortBy(arr, ["text", "value"]);
      }
      arr.unshift({
        value: "",
        parent: "",
        text: this.$t("exchange.content.all")
      });
      return arr;
    }
  },
  mixins: [utils],
  mounted() {
    this.baseItems = this.getBaseItems();
    this.quoteItems = this.getQuoteItems();
    let ps1 = new PerfectScrollbar(".ps-dropdown-quote");
    let ps2 = new PerfectScrollbar(".ps-dropdown-base");
    this.$nextTick(() => {
      if (ps1) ps1.update();
      if (ps2) ps2.update();
    });
  }
};
</script>