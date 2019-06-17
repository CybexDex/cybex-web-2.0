import Vue from 'vue'
import Vue2Filters from 'vue2-filters'
import moment from 'moment'
import { floor, ceil, round } from 'lodash';
import config from '~/lib/config/config.js';
import Bignumber from 'bignumber.js';

Vue.use(Vue2Filters)

// TEST. || JADE.
const coinPreg = new RegExp(`^${config.appconfig.gatewayUser.asset_prefix}`);
// ARENA.
const gamecoinPreg = new RegExp(`^${config.game_prefix}`);

const filters = {
  /**
   * 显示指定格式日期
   * @param {Date | String | Number} d 日期
   * @param {String} f format字符串 
   */
  date: (d, f) => {
    const local = moment.utc(d).toDate();
    return moment(local).format(f);
  },
  /**
   * 根据币id显示币名(去前缀的)
   * @param {String} id 币id
   * @param {Object} coinMap 包含所有币信息的对象
   */
  coinName: (id, coinMap) => {
    return coinMap && coinMap[id] ? coinMap[id].replace(coinPreg, '') : id;
  },
  /**
   * 对大数值进行精简显示
   * 百万级小数点精度不得超过2
   * 千级小数点精度不得超过4
   * 
   * > 百万 xx m
   * > 千 xx k
   * 
   * @param {*} value 精简的数值
   * @param {*} precision 小数点精度
   */
  shortenVolume(value, precision) {
    let v = new Bignumber(value);
    let mNum = 10000 * 100;
    let tNum = 1000;
    precision = parseInt(precision) || 2;
    let result = 0;
    if (v.isGreaterThanOrEqualTo(mNum)) {
      precision = precision > 2 ? 2 : precision;
      result = v.dividedBy(mNum).toFormat(precision, {decimalSeparator: '.', suffix: 'm'});
    } else if (v.isGreaterThanOrEqualTo(tNum)) {
      precision = precision > 4 ? 4 : precision;
      result = v.dividedBy(tNum).toFormat(precision, {decimalSeparator: '.', suffix: 'k'});
    } else {
      result = v.toFixed(precision);
    }
    return result;
  },
  /**
   * 限制价格显示字节长度
   * @param {Number | String} value 
   * @param {Number} maxPrecision
   */
  shortenPrice(value, maxPrecision = 10) {
    const oldP = value ? value.toString() : '';
    const oldLen = oldP.length;
    if (oldLen < maxPrecision) {
      return value;
    }
    return oldP.substr(0, maxPrecision);
  },
  priceChange(value) {
    value = parseFloat(value)
    return  value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
  },
  /**
   * 1.234 | floorDigits(2)           // 输出1.23
   * 1.239 | floorDigits(2)           // 输出1.23
   * 1.234 | floorDigits(2, '', '-')  // 输出1.23
   * '' | floorDigits(2, '', '-')     // 输出 -
   * null | floorDigits(2, null, '')  // 输出 ''
   * @param {*} val 
   * @param {*} digit 
   * @param {*} emptyVal 
   * @param {*} emptySymbol 
   */
  floorDigits(val, digit, emptyVal, emptySymbol) {
    if (typeof emptyVal !== undefined && val === emptyVal)
      return typeof emptySymbol !== undefined ? emptySymbol : '-'
    else
      return floor(val, digit).toFixed(digit);
  },
  /**
  * 显示精度，向上取整
  * 1.234 | floorDigits(2)           // 输出1.24
  * 1.239 | floorDigits(2)           // 输出1.24
  * 1.234 | floorDigits(2, '', '-')  // 输出1.24
  * '' | floorDigits(2, '', '-')     // 输出 -
  * null | floorDigits(2, null, '')  // 输出 ''
  * @param {*} val 
  * @param {*} digit 
  * @param {*} emptyVal 
  * @param {*} emptySymbol 
  */
  ceilDigits(val, digit, emptyVal, emptySymbol) {
    if (typeof emptyVal !== undefined && val === emptyVal)
      return typeof emptySymbol !== undefined ? emptySymbol : '-'
    else
      return ceil(val, digit).toFixed(digit);
  },
  /**
   * 显示精度，四舍五入
   * 1.234 | roundDigits(2)           // 输出1.23
   * 1.239 | roundDigits(2)           // 输出1.24
   * 1.234 | roundDigits(2, '', '-')  // 输出1.23
   * '' | roundDigits(2, '', '-')     // 输出 -
   * null | roundDigits(2, null, '')  // 输出 ''
   * @param {*} val 
   * @param {*} digit 
   * @param {*} emptyVal 
   * @param {*} emptySymbol 
   */
  roundDigits(val, digit, emptyVal, emptySymbol) {
    if (typeof emptyVal !== undefined && val === emptyVal)
      return typeof emptySymbol !== undefined ? emptySymbol : '-'
    else
      return round(val, digit).toFixed(digit);
  },
  /**
   * 法币精度显示
   * 价格大于等于1时候 显示2位
   * 价格小于1时 显示4位精度
   * @param {*} symbol 货币符号
   * @param {*} val 价格数值
   */
  legalDigits(val, symbol) {
    let digits = 2, digitsLow = 4;
    if (!val) return symbol + 0;
    if (val >= 1) {
      return symbol + parseFloat(val).toFixed(digits)
    } else {
      return symbol + parseFloat(val).toFixed(digitsLow)
    }
  },
  /**
   * 隐藏币种前缀
   * @param {*} symbol 
   */
  shorten (symbol) {
    return (symbol || '').replace(coinPreg, '')
  },
  /**
   * 隐藏交易大赛币种前缀
   * @param {*} symbol 
   */
  shortenContest (symbol, deal) {
    if (!deal) return symbol;
    return (symbol || '').replace(gamecoinPreg, '')
  },
  /**
   * 截取币名首字母
   * @param {*} symbol 
   */
  firstLetterCoin (symbol) {
    return (symbol || '').substr(0, 1);
  }
}

for (const name in filters) {
  Vue.filter(name, filters[name])
}
