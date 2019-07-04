import Vue from 'vue'
import Vue2Filters from 'vue2-filters'
import moment from 'moment'
import { floor, ceil, round, isNumber } from 'lodash';
import config from '~/lib/config/config.js';

Vue.use(Vue2Filters)


const coinPreg = new RegExp(`^${config.appconfig.gatewayUser.asset_prefix}`);
const gamecoinPreg = new RegExp(`^${config.game_prefix}`);
const filters = {
  date: (d, f) => {
    const local = moment.utc(d).toDate();
    return moment(local).format(f);
  },
  coinName: (id, coinMap) => {
    return coinMap && coinMap[id] ? coinMap[id].replace(coinPreg, '') : id;
  },
  /**
   * TODO: 
   * @param {*} value 
   * @param {*} precision 
   */
  shortenVolume(value, precision) {
    value = parseFloat(value)
    precision = precision || 2
    let result = 0
    if (isNumber(value)) {
      if (value > 100 * 10000) {
        const num = parseFloat(value / 100 / 10000)
        precision = precision > 2 ? 2 : precision;
        result = `${[num.toLocaleString().split('.').shift(), num.toFixed(precision).split('.').pop()].join('.')}m`
      } else if (value > 1000) {
        const num = parseFloat(value / 1000)
        precision = precision > 4 ? 4 : precision;
        result = `${[num.toLocaleString().split('.').shift(), num.toFixed(precision).split('.').pop()].join('.')}k`
      } else {
        result = [value.toLocaleString().split('.').shift(), value.toFixed(precision).split('.').pop()].join('.')
      }
    }
    return result
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
  shorten (symbol) {
    return (symbol || '').replace(coinPreg, '')
  },
  shortenContest (symbol, deal) {
    if (!deal) return symbol;
    return (symbol || '').replace(gamecoinPreg, '')
  },
  firstLetterCoin (symbol) {
    return (symbol || '').substr(0, 1);
  }
}

for (const name in filters) {
  Vue.filter(name, filters[name])
}
