<template>
  <div>
    <h1>gateway-test</h1>
    <div>打开console</div>
  </div>
</template>
<script>
import _ from "lodash"
import {Gateway} from "./gateway";
import { g } from "./cybex_help";
let gateway = new Gateway("http://39.98.58.238:8181",g)
export default {
  layout: "empty",
  data() {
    return {
      
    };
  },
  methods: {
    async test() {
      console.log("test");
      gateway.test()
      let s = await gateway.asset_list()
      console.log("asset_list",s)
      s = await gateway.get_asset("ETH")
       console.log("get_asset",s)
      s = await gateway.verify_addrss("ETH","adadadad")
       console.log("verify_addrss fail",s)
      s = await gateway.verify_addrss("ETH","0xC3ABEBBAEf594f9ceCa420e3Bad4a45D457f60fa")
       console.log("verify_addrss ok",s)
      s = await gateway.user_address("yangyu2","ETH")
       console.log("user_address ok",s)
      // s = await gateway.user_address("yangyu234","ETH")
      //  console.log("user_address ok",s)
       s = await gateway.get_user_records("yangyu2","deposit","ETH","5","54")
       console.log("get_user_records ok",s)
       s = await gateway.get_records_desc("yangyu2")
       console.log("get_records_desc ok",s)
    }
  },
  async created(){

  },
  async mounted() {
    await g.unlock("yangyu2","P5KajdFmdRffDgr7NM8xcSkYAWVMXxsaH2YPoPJ1PnoCs")
    await this.test();
  }
};
</script>