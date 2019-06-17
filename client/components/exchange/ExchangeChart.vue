<template>
  <v-flex class="tv-chart-container" ref="chartContainer" :class="{'fullscreen': isFullScreen}">
    <v-flex d-flex class="chart-tools" align-center>
      <!-- <span class="cybex-icon-candle mr-2"/> -->
      <span class="flex-label">
        <span>
          <v-icon class="ind-icon" size="20" v-text="'ic-indicators'"/>
          <span class="ml-0 pl-0" @click="toggleIndicatorDialog" v-text="$t('exchange.content.indicators')"/>
        </span>
        <span
          v-for="(resItem, idx) of resolutionItems"
          :key="idx"
          :class="{active: resItem.key == currentResolution}"
          @click="changeResolution(resItem)"
        >{{ $t("exchange.content."+resItem.label) }}</span>
      </span>
      <v-flex class="text-right">
        <v-btn :ripple="false" class="pa-0 ma-0 full-size" small icon @click="toggleFullScreen"><v-icon size="20">ic-full</v-icon></v-btn>
      </v-flex>
    </v-flex>

    <loading v-if="!isReady"/>
    <div :id="containerId"/>
  </v-flex>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment-timezone";
import utils from "~/components/mixins/utils";
import { invert, values, forEach } from "lodash";
import { Datafeed } from "./datafeed.js";

export default {
  components: {
    Loading: () => import("~/components/exchange/ExchangeLoading.vue")
  },
  props: {
    interval: {
      default: "60",
      type: String
    },
    containerId: {
      default: "tv_chart_container",
      type: String
    },
    libraryPath: {
      default: "/charting_library/",
      type: String
    },
    clientId: {
      default: "tradingview.com",
      type: String
    },
    userId: {
      default: "public_user_id",
      type: String
    },
    fullscreen: {
      default: false,
      type: Boolean
    },
    autosize: {
      default: true,
      type: Boolean
    }
  },
  mixins: [utils],
  data() {
    return {
      isFullScreen: false,
      tvWidget: null,
      isReady: false,
      upColor: "rgba(91, 154, 66, 1)",
      downColor: "rgba(210, 70, 50, 1)", //"rgba(172, 61, 48, 1)",
      bgColor: "#171d2a", //#363c4e
      bgColor2: "#1b2230",
      // 15秒, 1分钟, 5分钟, 1小时, 24小时
      resolutionItems: [
        // { key: "15S", value: "15", label: "15S", disabled: false },
        { key: "1", value: "60", label: "1M", disabled: false },
        { key: "5", value: "300", label: "5M", disabled: false },
        { key: "60", value: "3600", label: "1H", disabled: false },
        { key: "1D", value: "86400", label: "1D", disabled: false }
      ],
      currentResolution: '60',
      resolution: {
        // 15: "15S",
        60: "1",
        300: "5",
        // 900: "15",
        // 1800: "30",
        3600: "60",
        // 14400: "240",
        86400: "1D"
      },
      studiesOverrides: {
        "volume.volume.color.0": "rgba(210, 70, 50, 0.5)",
        "volume.volume.color.1": "rgba(91, 154, 66, 0.5)",
        "volume.volume.border": "white",
        "volume.volume.transparency": 100
      }
    };
  },
  computed: {
    ...mapGetters({
      locale: "i18n/locale",
      baseCurrency: "exchange/base",
      quoteCurrency: "exchange/quote",
      base_id: "exchange/base_id",
      quote_id: "exchange/quote_id"
    }),
    symbol: function() {
      return this.baseCurrency + "_" + this.quoteCurrency;
    },
    priceDigits: function() {
      return this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "book",
        "last_price",
        2
      );
    },
    timeframe: function() {
      return "";
    },
  },
  methods: {
    changeResolution: function(item) {
      this.currentResolution = item.key;
      this.tvWidget.chart().setResolution(item.key);
    },
    toggleToolbar: function() {
      this.tvWidget.chart().executeActionById("drawingToolbarAction");
    },
    toggleIndicatorDialog: function() {
      this.tvWidget.chart().executeActionById("insertIndicator");
    },
    toggleFullScreen: function() {
      this.isFullScreen = !this.isFullScreen;
    },
    initKlineData: function() {
      let pricescale = this.getPairConfig(
        this.baseCurrency,
        this.quoteCurrency,
        "book",
        "last_price",
        2
      );
      let cybexDatafeed = new Datafeed({
        cybexjs: this.cybexjs,
        base_id: this.base_id,
        quote_id: this.quote_id,
        resolution: this.resolution,
        pricescale: pricescale
      });
      return cybexDatafeed;
    }
  },
  mounted() {
    this.isReady = false;
    let datafeed = this.initKlineData();
    const widgetOptions = {
      // debug: true,
      symbol: this.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: datafeed,
      interval: this.interval,
      theme: "dark",
      toolbar_bg: this.bgColor,
      loading_screen: {
        backgroundColor: this.bgColor,
        foregroundColor: this.bgColor,
      },
      container_id: this.containerId,
      library_path: this.libraryPath,
      timeframe: this.timeframe,
      time_frames: [], // chart底部可选时间
      locale: this.locale,
      enabled_features: [
        "dont_show_boolean_study_arguments",
        "hide_last_na_study_output"
      ],
      disabled_features: [
        "header_widget",
        // "header_symbol_search",
        // "header_resolutions",
        // "header_settings",
        // "header_indicators",
        // "header_compare",
        // "header_undo_redo",
        // "header_screenshot",
        // "header_fullscreen_button",
        // "header_saveload",
        "compare_symbol",
        "border_around_the_chart",
        // "symbol_info",
        "volume_force_overlay",
        "use_localstorage_for_settings",
        "countdown"
      ],
      client_id: this.clientId,
      user_id: this.userId,
      fullscreen: this.fullscreen,
      autosize: this.autosize,
      studies_overrides: this.studiesOverrides,
      overrides: {
        volumePaneSize: "tiny", // 下方volume默认显示大小
        "paneProperties.background": this.bgColor, // 背景色
        "paneProperties.vertGridProperties.color": this.bgColor, //背景纵线 隐藏
        "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.04)", // 背景横线
        "scalesProperties.backgroundColor": this.bgColor, // 背景色
        adaptive_logo: true, // 小尺寸时隐藏logo
        "mainSeriesProperties.showCountdown": false, // 不需要倒计时
        "paneProperties.legendProperties.showStudyArguments": true,
        "paneProperties.legendProperties.showStudyTitles": true,
        "paneProperties.legendProperties.showStudyValues": true, // 显示volume具体值
        "paneProperties.legendProperties.showSeriesTitle": true, // 显示币名 当前选择周期
        "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0.00)",
        "paneProperties.legendProperties.showSeriesOHLC": true, // 显示最高最低价格
        "paneProperties.legendProperties.showLegend": true,
        "mainSeriesProperties.style": 1, // 默认使用k线图,
        "scalesProperties.textColor" : "rgba(255, 255, 255, 0.5)", // 坐标轴文本颜色
        // k线图颜色
        "mainSeriesProperties.candleStyle.wickUpColor": this.upColor,
        "mainSeriesProperties.candleStyle.wickDownColor": this.downColor,
        "mainSeriesProperties.candleStyle.upColor": this.upColor,
        "mainSeriesProperties.candleStyle.downColor": this.downColor,
        // 修改border颜色才会更改最高最低价格颜色
        "mainSeriesProperties.candleStyle.borderUpColor": this.upColor,
        "mainSeriesProperties.candleStyle.borderDownColor": this.downColor, 
        "mainSeriesProperties.candleStyle.drawBorder": false,
        
        "mainSeriesProperties.haStyle.upColor": this.upColor,
        "mainSeriesProperties.haStyle.downColor": this.downColor,
        "mainSeriesProperties.haStyle.borderUpColor": this.upColor,
        "mainSeriesProperties.haStyle.borderDownColor": this.downColor,

        "mainSeriesProperties.barStyle.upColor": this.upColor,
        "mainSeriesProperties.barStyle.downColor": this.downColor,
        // "mainSeriesProperties.barStyle.borderUpColor": this.upColor,
        // "mainSeriesProperties.barStyle.borderDownColor": this.downColor,

        "mainSeriesProperties.hollowCandleStyle.upColor": this.upColor,
        "mainSeriesProperties.hollowCandleStyle.downColor": this.downColor,
        "mainSeriesProperties.hollowCandleStyle.borderUpColor": this.upColor,
        "mainSeriesProperties.hollowCandleStyle.borderDownColor": this.downColor,

        "mainSeriesProperties.baselineStyle.topFillColor1": "rgba(109, 187, 73, 0.3)",
        "mainSeriesProperties.baselineStyle.topFillColor2": "rgba(109, 187, 73, 0.3)",
        "mainSeriesProperties.baselineStyle.bottomFillColor1": "rgba(190, 70, 52, 0.3)",
        "mainSeriesProperties.baselineStyle.bottomFillColor2": "rgba(190, 70, 52, 0.3)",
        "mainSeriesProperties.baselineStyle.topLineColor": "rgba(109, 187, 73, 0.3)",
        "mainSeriesProperties.baselineStyle.bottomLineColor": "rgba(190, 70, 52, 0.3)",

        
        // 时区
        timezone: moment.tz.guess()
        // editorFontsList: ['cybex-medium', 'Verdana', 'Courier New', 'Times New Roman', 'Arial']
      }
    };
    this.tvWidget = new window.TradingView.widget(widgetOptions);
    const averagePrecision = 8;
    this.tvWidget.onChartReady(() => {
      this.isReady = true;
      this.tvWidget
        .chart()
        .createStudy("Moving Average", false, false, [7], null, {
          "Plot.color": "#ff9143",
          precision: averagePrecision
        });
      this.tvWidget
        .chart()
        .createStudy("Moving Average", false, false, [25], null, {
          precision: averagePrecision
        });
      this.tvWidget
        .chart()
        .createStudy("Moving Average", false, false, [99], null, {
          precision: averagePrecision
        });
    });
    // this.tvWidget.chart().subscribe(null, "onDataLoaded", () => {
    //   console.log("data reloaded");
    // });
  }
};
</script>

<style lang="stylus" scoped>
@import '~assets/style/_vars/_vars';

.loading {
  background: #171d2a;
  position: absolute;
  width: 100%;
  min-height: k-line-min-height;
}
.small-size
  .tv-chart-container  {
    height: 'calc(60% - %s)' % small-activity-height;
  }
.tv-chart-container {
  position: relative;
  min-height: 'calc(%s + %s)' % (k-line-min-height k-line-toolbar-height);
  height: 'calc(60% - %s)' % activity-height;
  &.fullscreen {
    position: fixed;
    width: 100%;
    height: 100%;
    top:0;
    left: 0;
    z-index: 9;
    background: #171d2a;
  }
}

#tv_chart_container {
  // min-height: k-line-min-height
  height: 'calc(100% - %s)' % k-line-toolbar-height;
}

.chart-tools {
  height: k-line-toolbar-height
  .full-size {
    width: k-line-toolbar-height;
    height k-line-toolbar-height;
  }
  .flex-label {
    > span {
      padding: 5px 7px 3px;
      box-shadow: inset 0 -1px 0 0 #111621;
      &:first-child {
        margin-right: -2px;
      }
      &.active {
        color: #FF9143;
      }
      border-radius: 0;
      margin: 8px 1px;
    }
    i {
      height: 14px;
      padding-bottom: 2px;
    }
  }
}

.cybex-icon-candle {
  display: inline-flex;
  background: url('~assets/svg/candle.svg') no-repeat center;
  width: 20px;
  height: 32px;
  flex: 0 0 20px !important;
  align-items: center;
  flex-direction: column;
  text-align: center;
  margin: 6px auto;
}
</style>