<template>
  <div>
    <h1>hello</h1>
    <div>
      <p>{{output}}</p>
      <h2>注册</h2>
      <v-flex xs2 offset-xs1>
        <v-text-field label="username" v-model="username"/>
      </v-flex>
      <v-flex xs2 offset-xs1>
        <v-text-field label="password" v-model="password"/>
      </v-flex>
      <v-flex xs2 offset-xs1>
        <v-text-field label="code" v-model="newcode"/>
      </v-flex>
      <p>
        <span @click="getcode" v-html="code"/>
      </p>

      <v-btn @click="register">注册</v-btn>
      <h2>导入脑钱包</h2>
      <p>
        <v-flex xs2 offset-xs1>
          <v-text-field label="脑钱包 or 私钥" v-model="brainInput"/>
        </v-flex>
        <v-flex xs2 offset-xs1>
          <v-text-field label="password" v-model="brainPass"/>
        </v-flex>
        <v-btn @click="importBrain">导入脑钱包</v-btn>
        <v-btn @click="addWifKey">导入私钥</v-btn>
        <v-btn @click="fromWifKey">从私钥恢复</v-btn>
      </p>
      <h2>导入bin</h2>
      <p>
        <v-flex xs2 offset-xs1>
          <input
            ref="file"
            accept=".bin"
            type="file"
            id="backup_input_file"
            @change="uploadBin"
          >
        </v-flex>
        <v-flex xs2 offset-xs1>
          <v-text-field label="password" v-model="binPass"/>
        </v-flex>
         <v-btn @click="importBin">导入bin文件</v-btn>
      </p>
      <p>
           <v-btn @click="getAccounts">用户ID</v-btn>
      </p>
      <h2>导出bin文件</h2>
      <p>
        <v-btn @click="exportBin">导出bin</v-btn>
      </p>
      <h2>导出脑钱包</h2>
      <p>
       <v-flex xs2 offset-xs1>
          <v-text-field label="password" v-model="brainPassExport"/>
        </v-flex>
        <v-btn @click="exportBrain">导出脑钱包</v-btn>
      </p>
      <p>
        <v-btn @click="unlocktest">unlocktest</v-btn>
        <v-btn @click="createlimit">挂单</v-btn>
      </p>
    </div>
  </div>
</template>
<script>
import { g } from "./cybex_help";
import Wallet from "./wallet";
import { saveAs } from "file-saver";
import _ from "lodash"
export default {
  layout: "empty",
  data() {
    return {
      username: "",
      password: "",
      newcode: "",
      code: null,
      codeid: null,
      output: "",
      wallet: null,
      brainInput: null,
      brainPass: null,
      inputBinBuffer:null,
      binPass:null,
      brainPassExport:null
    };
  },
  methods: {
    addWifKey(password,wif){
       this.wallet.addWifKey(this.brainPass,this.brainInput)
    },
    fromWifKey(password,wif){
      let w =  Wallet.FromPrikey(this.brainInput,this.brainPass);
      this.wallet = w;
      this.output = w.total_obj;
    },
    async importBin(){
      let w = await Wallet.FromBin(this.inputBinBuffer,this.binPass);
      this.wallet = w;
      this.output = w.total_obj;
    },
    async importBrain() {
      let w = await Wallet.FromBrainKey(this.brainInput, this.brainPass);
      this.wallet = w;
      this.output = w.total_obj;
    },
    uploadBin() {
      console.log(this.$refs.file)
      if (this.$refs.file && this.$refs.file.files.length>0){
        console.log("upload")
      this.file = this.$refs.file.files[0];
      this.incommingWebFile(this.file)
      }
    },
    incommingWebFile(file) {
  
      let reader = new FileReader();
      reader.onload = evt => {
        let contents = new Buffer(evt.target.result, "binary");
        let name = file.name;
        // console.debug("FILE: ", file);
        let last_modified = file.lastModifiedDate
          ? file.lastModifiedDate.toString()
          : file.lastModified
          ? new Date(file.lastModified).toString()
          : "unknown";
        console.log(contents)
        this.inputBinBuffer = contents
        // dispatch({ name, contents, last_modified });
      };
      console.log("file",file)
      reader.readAsBinaryString(file);
    },
    async createWalletFromBrain() {
      let w = await Wallet.FromBrainKey(
        "griffe castle relishy rower gym sealer ligable carotin bewitch unflag pollan jacent woady refurl outking nervish",
        "yangyulocalpass"
      );
      this.wallet = w;
      this.output = w.total_obj;
      console.log("createWalletObject", w.get_total_object());
    },
    walletkeys(){
     let keys = this.wallet.getKeyPairs("yangyulocal")
      console.log(keys)
    },
    async unlocktest(){
      await this.createWalletFromBrain()
      let keys = this.wallet.getKeyPairs("yangyulocalpass")
      console.log("keys",keys)
      await g.unlockKeyPairs(keys,"yangyulocal1")
      // await g.chooseUser("yangyulocal1")
      // await this.createlimit()
    },
    async createlimit(){
      let s =  await g.limit_order_create("1.3.0", "1.3.2", "buy", "0.1", "0.1")
      console.log(
        "trade",
        s
      );
      this.output = s
    },
    exportBrain(){
      let s = this.wallet.getBrainKey(this.brainPassExport)
      this.output = s
    },
    async exportBin() {
      // await Wallet.backup()
      if (!this.wallet) {
        alert("没有钱包对象");
        return;
      }
      let s = await this.wallet.exportBin();

      let blob = new Blob([s], {
        type: "application/octet-stream; charset=us-ascii"
      });
      console.log(s, blob);
      saveAs(blob, "default.bin");
    },
    async register() {
      let w = await Wallet.CreateWallet(
        this.username,
        this.password,
        this.newcode,
        this.codeid
      );
      console.log("register", w.get_total_object());
      this.wallet = w;
      this.output = JSON.stringify(w.get_total_object());
    },
    async getcode() {
      let s = await g.verify_code();
      console.log(s);
      this.code = s.data;
      this.codeid = s.id;
    },
    async getAccounts(){
      let pubs = this.wallet.total_obj.private_keys.map(i=>i.pubkey)
      let accts = await g.key_accounts(pubs)
      this.output = accts
    },
    async unlock() {
      let s = await g.unlock(
        "yangyu123", //"test-summer",//"yangyutest1",yangyu123
        "P5KNfAPu82LyAuJeD7NwgggWJvqZ9UREUpXQCwCNdGp8z", //"Abcd1234abcd1234",//"P5HuDhKrZsxeB3LPio8c8Kv3XNhh4cqnWj8dwnDTYordR",P5KNfAPu82LyAuJeD7NwgggWJvqZ9UREUpXQCwCNdGp8z
        500
      );
      console.log(s);
      this.out = s.code;
    },
    async test() {
      console.log("test");
      
      await this.unlock()
      let x = await g.calAmountAndFee("yangyu123", 0.1, "JADE.ETH", "0x1231231313") 
      // s = s.map(i=>{
      //   return {wif:i.privKey.toWif(),pub:i.pubKey}
      // })
      console.log(1,x)
      // await this.getAccounts()
      // await this.walletkeys()
      // await this.exportBin()
    }
  },
  async created(){
    await g.start()
  },
  async mounted() {
    // await g.start()
    await this.getcode();
    await this.test();
  }
};
</script>