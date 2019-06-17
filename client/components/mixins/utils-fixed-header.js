export default {
  data(){
    return {
      showFixedHeader: false,
    }
  },
  methods: {
    onFixedHeader($el, $header) {
      if ($el && $header) {
        const cols = $el.querySelectorAll(
          "[role='columnheader']"
        );
        const headers = $header.querySelectorAll(".col-header");
        headers.forEach((ele, idx) => {
          headers[idx].style.width = cols[idx].clientWidth + "px";
        });
        this.showFixedHeader = true;
      }
    },
  }
}