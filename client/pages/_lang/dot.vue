<template>
  <div class="create-order-dot">
    <!-- 首页图片 -->
    <div class="dot-header">
      <div class="dot-header-info">
        <div>
          <v-img
            height="110"
            width="285"
            contain
            :src="imgTextUrl"
            alt="create order"
            data-radium="true"
          />
        </div>
        <button class="header-info-btn" @click="handleDotInfo">{{ $t('dot.rule') }}</button>
        <!-- DOT 弹窗说明 -->
        <v-dialog
          v-model="showNoticeDialog"
          persistent
          content-class="notice-dialog"
          width="464"
          scrollable
        >
          <v-icon class="btn-close" @click="closeNoticeDialog">ic-close</v-icon>
          <div class="dot-content">
            <div class="dot-title"> {{ $t('dot.dot_notice.title') }}</div>
            <!-- rules -->
            <div class="dot-rules-title">{{ $t(`dot.dot_notice.line_1`) }}</div>
            <div class="dot-rules-content" v-for="idx of [1, 2, 3, 4, 5, 6]" :key="'rule'+idx">
              {{ $t(`dot.dot_notice.line_1_${idx}`) }}
            </div>
            <!-- requirements -->
            <div class="dot-rules-title">{{ $t(`dot.dot_notice.line_2`) }}</div>
            <div class="dot-rules-content" v-for="idx of [1, 2, 3]" :key="'require'+idx">
              {{ $t(`dot.dot_notice.line_2_${idx}`) }}
            </div>
            <!-- calculation -->
            <div class="dot-rules-title">{{ $t(`dot.dot_notice.line_3`) }}</div>
            <div class="dot-rules-content" v-for="idx of [0, 1, 2, 3, 4]" :key="'calc'+idx">
              {{ $t(`dot.dot_notice.line_3_${idx}`) }}
            </div>
            <!-- order weight -->
            <div class="dot-rules-title">{{ $t(`dot.dot_notice.line_4`) }}</div>
            <table class="rules-table">
              <tr class="rules-table-tr">
                <th class="rules-talbe-th">{{ $t('dot.dot_notice.header_1') }}</th>
                <th class="rules-talbe-th">{{ $t('dot.dot_notice.header_2') }}</th>
                <th class="rules-talbe-th">{{ $t('dot.dot_notice.header_1') }}</th>
                <th class="rules-talbe-th">{{ $t('dot.dot_notice.header_2') }}</th>
              </tr>
              <tr class="rules-table-tr">
                <td>{{ $t('dot.dot_notice.td_buy_1') }}</td>
                <td>10</td>
                <td>{{ $t('dot.dot_notice.td_sell_1') }}</td>
                <td>1</td>
              </tr>
              <tr class="rules-table-tr">
                <td>{{ $t('dot.dot_notice.td_buy_2') }}</td>
                <td>4</td>
                <td>{{ $t('dot.dot_notice.td_sell_2') }}</td>
                <td>2</td>
              </tr>
              <tr class="rules-table-tr">
                <td>{{ $t('dot.dot_notice.td_buy_3') }}</td>
                <td>2</td>
                <td>{{ $t('dot.dot_notice.td_sell_3') }}</td>
                <td>5</td>
              </tr>
              <tr class="rules-table-tr">
                <td>{{ $t('dot.dot_notice.td_buy_4') }}</td>
                <td>1</td>
                <td>{{ $t('dot.dot_notice.td_sell_4') }}</td>
                <td>0.5</td>
              </tr>
            </table>
            <!-- bonus -->
            <div class="dot-rules-title">{{ $t(`dot.dot_notice.line_5`) }}</div>
            <div class="dot-rules-content" v-for="idx5 of [0, 1, 2, 3, 4]" :key="'bonus'+idx5">
              {{ $t(`dot.dot_notice.line_5_${idx5}`) }}
            </div>
            <!-- note -->
            <div class="dot-rules-title">{{ $t(`dot.dot_notice.line_6`) }}</div>
            <div class="dot-rules-content" v-for="idx6 of [1, 2, 3]" :key="'note'+idx6">
              {{ $t(`dot.dot_notice.line_6_${idx6}`) }}
            </div>
          </div>
        </v-dialog>
      </div>
    </div>
    <!-- 账户信息 -->
    <div class="account-info">
      <div class="account-info-tag">
        <div class="info-tag-title">{{ $t('dot.my_bonus') }}</div>
        <div class="info-tag-num">{{ myBonus }} PCX</div>
      </div>
      <div class="account-info-tag">
        <div class="info-tag-title">{{ $t('dot.my_ranking') }}</div>
        <div class="info-tag-num">{{ myRanking }}</div>
      </div>
      <div class="account-info-tag">
        <div class="info-tag-title">{{ $t('dot.my_points') }}</div>
        <div class="info-tag-num">{{ myPoints }}</div>
      </div>
    </div>
    <!-- 积分排名 -->
    <div class="dot-rank">
      <!-- 积分排名 -->
      <div class="dot-rank-tag">
        <span>{{ $t('dot.p_ranking') }}</span>
      </div>
      <!-- 排名 账户名  当前积分  table 表格-->
      <div class="dot-rank-title">
        <table class="dot-rank-table">
          <tr class="table-title">
            <th class="table-title-rank">{{ $t('dot.ranking') }}</th>
            <th>{{ $t('dot.name') }}</th>
            <th class="table-title-score">{{ $t('dot.current_points') }}</th>
          </tr>
          <tr v-for="(item, index) in dotList" :key="index" class="table-info">
            <td class="table-info-rank">{{ item.rank }}.</td>
            <td>{{ item.name }}</td>
            <td class="table-info-score">{{ item.score }}</td>
          </tr>
        </table>
      </div>
      <!-- ul 列表 -->
      <!-- <div></div> -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      myBonus: "--",
      myRanking: "--",
      myPoints: "--",
      dotList: [],
      showNoticeDialog: false // 展示 DOT 弹窗
    };
  },
  computed: {
    ...mapGetters({
      navMenus: "navMenus",
      username: "auth/username", // 获取用户名
      userId: "auth/userId", // 获取账户id
      locale: "i18n/locale" // 当前语言环境
    }),
    imgTextUrl() {
      return this.locale != "en"
        ? require("~/assets/images/img-text-zh.svg")
        : require("~/assets/images/img-text-en.svg");
    }
  },
  methods: {
    // 查看规则 按钮
    handleDotInfo() {
      if (this.navMenus && this.navMenus.internal.dot) {
        let url = this.locale == 'en' ? this.navMenus.internal.dot.rulesUrlEn : this.navMenus.internal.dot.rulesUrlZhCn;
        window.open(url, '_blank');
      } else {
        this.showNoticeDialog = true;
      }
    },
    // 关闭规则
    closeNoticeDialog() {
      this.showNoticeDialog = false;
    },
    // 获取积分排名
    async getDotInfo() {
      // console.debug("YYYYYYYYYY: ", this.username);
      let result = await this.cybexjs.getDotPointsRanking(this.username);
      // 获取账户信息
      let my_bonus = result.mine;
      let my_rank = result.position;
      let my_score = result.score;
      if (Number(my_bonus != 0)) {
        // 换算成pcx精度
        this.myBonus = parseFloat((my_bonus / Math.pow(10, 6)).toFixed(6));
      } else {
        this.myBonus = my_bonus;
      }
      if (String(my_rank) === "-1") {
        this.myRanking = "--";
      } else {
        this.myRanking = my_rank;
      }
      if (Number(my_score) != 0) {
        this.myPoints = my_score.toFixed(2);
      } else {
        this.myPoints = my_score;
      }
      // 获取排名列表
      let rankList = result.top_records;
      for (let i in rankList) {
        let numb = i;
        rankList[i].rank = Number(numb) + Number(1);
        rankList[i].score = rankList[i].score.toFixed(2);
      }
      this.dotList = rankList;
    }
  },
  async created() {
    if (!this.userId) {
      await this.$store.dispatch("auth/getUserId");
    }
    this.getDotInfo();
  }
};
</script>

<style lang="stylus" scoped>
@require '~assets/style/_fonts/_font_mixin';
@require '~assets/style/_vars/_colors';

// 弹框样式
.notice-dialog {
  background: $main.lead;
  font-size: 12px;
  line-height: 1.83;
  color: rgba($main.white, 0.8);
  flex-direction: column;
  max-height: 510px !important;

  .dot-title {
    font-size: 16px;
    margin-bottom: 8px;
    f-cybex-style('heavy'); 
  }
  .dot-content {
    padding-top: 18px;
    padding-bottom: 10px;

    .rules-table {
      width: 400px;
      margin-bottom: 5px;
      color: rgba(255, 255, 255, 0.8);

      .rules-table-tr {
        height: 20px;

        .rules-talbe-th {
          text-align: left;
        }
      }
    }
  }

  .dot-rules-title {
    f-cybex-style('heavy');
    color: rgba($main.white, 0.85);
    margin-top: 18px;
    margin-bottom: 8px;
  }

  .dot-rules-content {
    f-cybex-style('medium');
    color: rgba($main.white, 0.8);
    margin-bottom: 3px;
    line-height: 1.45;
    &:last-child {
       margin-bottom:20px;
    }
  }
}

.create-order-dot {
  f-cybex-style('medium');
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 1280px;

  // DOT 图片
  .dot-header {
    height: 480px;
    min-width: 1280px;
    width: 100%;
    background: url('~assets/images/dot-img-bg.png') no-repeat center;
    background-size: cover;

    // 挂单挖矿 瓜分 DOT 说明
    .dot-header-info {
      margin-top: 128px;
      margin-left: 106px;

      // 按钮
      .header-info-btn {
        margin-top: 60px;
        margin-left: 30px;
        height: 48px;
        width: 200px;
        outline: none;
        border-radius: 25px;
        background-color: rgba(2, 21, 142, 0.4);
        font-size: 20px;
        line-height: 1.6;
        letter-spacing: 4px;
        color: #d4ccef;
      }
    }
  }

  // 账户信息
  .account-info {
    color: #000;
    height: 220px;
    width: 1136px;
    display: flex;
    justify-content: space-around;
    padding-top: 40px;

    .account-info-tag {
      height: 140px;
      width: 300px;
      background-color: #1b2230;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding-top: 42px;
      padding-bottom: 42px;

      .info-tag-title {
        // font-family: PingFangSC;
        font-size: 14px;
        // font-weight: 500;
        // font-style: normal;
        // font-stretch: normal;
        line-height: 1.14;
        letter-spacing: normal;
        text-align: center;
        color: rgba(255, 255, 255, 0.4);
      }

      .info-tag-num {
        font-family: AvenirLTPro;
        font-size: 24px;
        font-weight: 900;
        font-style: normal;
        font-stretch: normal;
        line-height: 0.83;
        letter-spacing: normal;
        text-align: center;
        color: #ffffff;
      }
    }
  }

  // 排行榜
  .dot-rank {
    width: 1136px;

    .dot-rank-tag {
      height: 40px;
      padding-top: 6px;
      padding-left: 26px;
      // font-family: PingFangSC;
      font-size: 24px;
      f-cybex-style('black');
      // font-weight: 600;
      // font-style: normal;
      // font-stretch: normal;
      line-height: 1.17;
      letter-spacing: 0.3px;
      color: #ffffff;
    }

    .dot-rank-title {
      margin-top: 10px;
      width: 1136px;
      padding-left: 27px;
      padding-right: 24px;

      // 表格设置
      .dot-rank-table {
        width: 1075px;
        margin-bottom: 70px;

        .table-title {
          padding-top: 12px;
          height: 40px;
          // font-family: PingFangSC;
          font-size: 12px;
          // font-weight: 500;
          // font-style: normal;
          // font-stretch: normal;
          line-height: 1.33;
          letter-spacing: normal;
          color: rgba(255, 255, 255, 0.4);
          text-align: left;

          .table-title-rank {
            width: 75px;
          }

          .table-title-score {
            text-align: right;
          }
        }

        .table-info {
          height: 32px;
          padding-top: 8px;
          opacity: 0.8;
          font-family: AvenirLTPro;
          font-size: 14px;
          font-weight: 900;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.14;
          letter-spacing: normal;
          color: #ffffff;

          .table-info-rank {
            width: 75px;
            opacity: 0.4;
            font-family: Rubik;
            font-size: 14px;
            font-weight: normal;
            font-style: normal;
            font-stretch: normal;
            line-height: 1.71;
            letter-spacing: normal;
            color: #ffffff;
          }

          .table-info-score {
            text-align: right;
          }
        }
      }
    }
  }
}
</style>

