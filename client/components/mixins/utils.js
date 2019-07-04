// import pair from "~/lib/pair_config.js";
import { some, get, isNumber, isString } from 'lodash';
import moment from "moment";
import { mapGetters } from 'vuex';
import config from '~/lib/config/config.js';
import BigNumber from 'bignumber.js';

export default {
  data() {
    return {
      dateDisplayFormat: "YYYY/MM/DD", // 显示用moment日期格式
      dateXHRFormat: "YYYY-MM-DDTHH:mm:ss", // 调用接口moment日期格式
      datepickerFormat: "YYYY-MM-DD", // 控件需要的moment日期格式
      staticDigits: {},
      staticCustomAssetDigits: {}
    }
  },
  computed: {
    ...mapGetters({
      pairs: 'user/pairs',
      coinMap: "user/coins",
      bases: "user/bases",
      whitelist: "user/whitelist"
    })
  },
  methods: {
    /**
     * 不在白名单列表中的资产为自定义资产
     * @param {*} asset_id 1.3.*
     */
    isCustomAsset(asset_id) {
      if (!this.whitelist || !asset_id) return;
      let result = some(this.whitelist, (v) => {
        return v == asset_id;
      });
      return !result;
    },
    /**
     * 检测是否
     * @param {*} base_id 
     * @param {*} quote_id 
     */
    isCustomPair(base_id, quote_id) {
      if (!this.bases || !base_id || !quote_id) return;
      // 交易对是否是默认
      let isDefaultAsset = false;
      if (this.bases[base_id] && this.bases[base_id].data) {
        isDefaultAsset = this.bases[base_id].data.indexOf(quote_id) > -1;
      }
      return !isDefaultAsset;
    },
    /* 科学计数法强制转换
     * @param { String | Number } num
     * @param { Number | Null } dp 小数点限制精度
     * @param { Number | Null } rm 小数点截取方式  Number | null 为空时为四舍五入
     * rm取值请参考链接 @see http://mikemcl.github.io/bignumber.js/#toFix
     * @return { NaN | Number} 
     */
    toNonExponential(num, limitdp = null, rm = BigNumber.ROUND_FLOOR) {
      // 精度 
      let correctVal;
      // 不出现科学计数法
      BigNumber.config({ EXPONENTIAL_AT: 1e+9 });
      let checknum = new BigNumber(num);
      let dp = checknum.dp(); // bignumber获取的dp
      let regx = `\\d*(\\.)(\\d*)$`;
      let couldSplit = num.toString().match(new RegExp(regx));
      // console.log('couldSplit', couldSplit);
      if (couldSplit) {
        let z = num.toString().split('.');
        dp = z.length > 1 ? z[1].length : dp;
        // 小数点后暂无输入
        if (dp == 0) {
          // console.log('原数字返回')
          return num;
        }
        // console.log('dp', dp);
      }
      if (limitdp) {
        dp = dp > limitdp ? limitdp : dp;
      }
      correctVal = checknum.toFixed(dp, rm);
      return correctVal;
    },
    detectZoom() {
      const screenCssPixelRatio = (window.outerWidth - 8) / window.innerWidth;
      return screenCssPixelRatio <= .92 || screenCssPixelRatio > 1.10
    },
    jumpTo(subpath) {
      if (this.$i18n) {
        this.$router.push(this.$i18n.path(subpath))
      }
    },
    getCoinIdByName(name, coinMap) {
      if (!coinMap) {
        coinMap = this.coinMap;
      }
      return coinMap && coinMap[name] ? coinMap[name] : name;
    },
    coinName(id, coinMap) {
      if (!coinMap) {
        coinMap = this.coinMap;
      }
      const preg = new RegExp(`^${config.appconfig.gatewayUser.asset_prefix}`);
      return coinMap && coinMap[id] ? coinMap[id].replace(preg, '') : id
    },
    getPairConfig(base, quote, key, subkey, dVal) {
      if (!base || !quote) return dVal;
      const re = new RegExp(`^${config.appconfig.gatewayUser.asset_prefix}`);
      base = base.replace(re, '');
      quote = quote.replace(re, '');
      const k = [base, quote, key, subkey]
      const check = k.join('-');
      if (!this.staticDigits[check]) {
        this.staticDigits[check] = get(this.pairs, k, dVal)
      }
      
      return this.staticDigits[check];
    },
    // 使用moment规范显示日期
    formatDate(date, formatStr) {
      return moment(date).format(formatStr);
    },
    /**
     * 
     * @param {*} array 
     * @param {*} callback 
     */
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
    open(url) {
      window.open(url)
    },
    drawCoinIcon(canvas, text) {
      var ctx = canvas.getContext("2d")
      ctx.fillStyle = "#c0c1c5"
      ctx.fillRect(0, 0, 20, 20)
      var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop("0", "black");
      gradient.addColorStop("0.5", "black");
      gradient.addColorStop("1.0", "grey");
      ctx.fillStyle = gradient;
      ctx.font = "14px cybex-black";
      ctx.fillText(text, 5, 14)
    }
  }
}