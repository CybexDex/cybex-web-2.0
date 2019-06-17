// export interface DatafeedInterface {

// }

// export interface bar {
//   time: number;
//   open: string;
//   high: string;
//   close: string;
//   volume: string;
// };
import moment from "moment-timezone";
import { invert, values } from "lodash";

export function convertResolutionByValue(value, source) {
  let search = invert(source);
  return search ? search[value] : null;
};

export async function getHistoryData(loader, base_id, quote_id, bucket_seconds, requestStartDate, requestEndDate) {
  let bars = [];
  let barsData = await loader.get_market_history(
    base_id,
    quote_id,
    bucket_seconds,
    requestStartDate,
    requestEndDate
  );
  barsData.forEach(data => {
    let time = moment.utc(data.key.open).valueOf();
    bars.push({
      time: time,
      close: data.close,
      open: data.open,
      high: data.high,
      low: data.low,
      volume: parseFloat(data.volume)
    });
  });
  return bars;
}

export class Datafeed {
  cybexjs;
  base_id;
  quote_id;
  intervalGetNewBar = null;
  bars = [];
  lastBar = {
    time: null,
    open: null,
    high: null,
    close: null,
    volume: null
  }
  // 时间间隔
  resolution;
  // 小数点精度
  pricescale;
  dateDisplayFormat = "YYYY/MM/DD";// 显示用moment日期格式
  dateXHRFormat = "YYYY-MM-DDTHH:mm:ss"; // 调用接口moment日期格式
  datepickerFormat = "YYYY-MM-DD"; // 控件需要的moment日期格式
  constructor(data) {
    ({ cybexjs: this.cybexjs, base_id: this.base_id, quote_id: this.quote_id, resolution: this.resolution, pricescale: this.pricescale } = data);
  }
  onReady(callback) {
    let config = {
      exchanges: [],
      symbols_types: [],
      supported_resolutions: values(this.resolution),
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: false
    };
    return setTimeout(function () {
      callback(config);
    }, 0);
  }
  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    console.log("chart searchSymbols");
    // search function
    onResultReadyCallback();
  };

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    symbolName = symbolName.split('_');
    symbolName = symbolName[1] + '_' + symbolName[0];
    let symbol_stub = {
      name: symbolName,
      ticker: symbolName,
      description: "",
      type: "crypto",
      session: "24x7",
      timezone: moment.tz.guess(),
      minmov: 1,
      pricescale: Math.pow(10, this.pricescale),
      has_intraday: true,
      has_seconds: true,
      has_no_volume: false,
      intraday_multipliers: values(this.resolution), 
      seconds_multipliers: values(this.resolution),
      supported_resolution: values(this.resolution),
      volume_precision: 8,
      data_status: "streaming",
    };
    if (symbol_stub) {
      setTimeout(function () {
        onSymbolResolvedCallback(symbol_stub);
      }, 0);
    } else {
      setTimeout(function () {
        onResolveErrorCallback("can not find by symbol name" + symbolName);
      }, 0);
    }
  }
  /**
    * 根据from to时间范围筛选历史数据
    */
  async getBars(symbolInfo, currentResolution, startDate, endDate, onHistoryCallback, onErrorCallback, firstDataRequest) {
    let bucket_seconds = convertResolutionByValue(currentResolution, this.resolution);
    if (!bucket_seconds) {
      bucket_seconds = 60;
    }
    // console.log('============= get bars');
    if (this.intervalGetNewBar) {
      clearInterval(this.intervalGetNewBar);
      this.intervalGetNewBar = null;
    }
    let start = moment
      .unix(endDate - bucket_seconds * 200)
      .utc()
      .format(this.dateXHRFormat);
    let end = moment
      .unix(endDate)
      .utc()
      .format(this.dateXHRFormat);
    try {
      this.bars = await getHistoryData(this.cybexjs, this.base_id, this.quote_id, bucket_seconds, start, end);
      if (this.bars.length) {
        this.lastBar = this.bars[this.bars.length - 1];
        onHistoryCallback(this.bars, { noData: false });
      } else {
        console.log("no more bar data");
        onHistoryCallback(this.bars, { noData: true });
      }
    } catch (err) {
      console.log(err);
      onErrorCallback(err);
    }
  }

  async subscribeBars(symbolInfo, currentResolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    let bucket_seconds = convertResolutionByValue(currentResolution, this.resolution);
    if (!bucket_seconds) {
      bucket_seconds = 60;
    }
    let requestNewBar = async () => {
      let start = moment
        .unix(this.lastBar.time / 1000)
        .utc()
        .format(this.dateXHRFormat);
      let end = moment()
        .utc()
        .format(this.dateXHRFormat);
      let bars = await getHistoryData(this.cybexjs, this.base_id, this.quote_id, bucket_seconds, start, end);
      if (bars.length) {
        let newLastBar = bars[bars.length - 1];
        this.lastBar = newLastBar;
        onRealtimeCallback(newLastBar);
        // console.log('============ subscribeBars new bars', newLastBar);
      }
    }
    await requestNewBar();
    if (!this.intervalGetNewBar) {
      this.intervalGetNewBar = setInterval(async () => {
        await requestNewBar();
      }, 3000)
    }
 
    /**
     *  @param bar object{time, close, open, high, low, volume}
     */
  };

  unsubscribeBars(subscriberUID) {
    // console.log("=====unsubscribeBars runnning", subscriberUID);
    clearInterval(this.intervalGetNewBar);
    this.intervalGetNewBar = null;
  };
}