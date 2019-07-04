<template>
  <v-layout class="rebate-layout" column>
    <div class="page-title">{{ $t('sub_title.debates_amount') }}</div>
    <div class="coin-card-wrapper d-flex">
      <div class="empty" v-if="showEmpty">{{ 'No coins matched rules of rebate.' }}</div>
      <div
        v-else
        d-flex
        column
        class="coin-card"
        v-for="(card, idx) of dataList"
        :key="idx"
        :class="{'ml-0': (idx+1)%1 === 1, 'mr-0': (idx+1)%4 === 0 || idx == dataList.length}"
      >
        <!-- absolute icons -->
        <div class="fixed-icons">
          <v-icon @click="goTransfer(card)">ic-send</v-icon>
          <!-- <v-icon @click="goWithdraw(card)" class="rotate-180deg">ic-deposit</v-icon> -->
        </div>
        <div class="d-flex align-center mb-3">
          <v-img
            v-if="iconsMap"
            class="mr-2"
            :src="iconsMap[card.asset_id]"
            max-width="24"
            width="24"
            height="24"
          />
          <span class="c-white-80">{{ card.name | shorten }}</span>
        </div>
        <div>
          <div class="label-amount">{{ $t('form_label.amount') }}</div>
          <div>{{ card.amount | floorDigits(card.digits) }}</div>
        </div>
      </div>
    </div>
  </v-layout>
</template>

<script>
import { mapGetters } from "vuex";
import { findIndex } from 'lodash';
export default {
  data() {
    return {
      isLoading: false,
      showEmpty: false,
      coinsList: [],
      dataList: [],
      testData: [
        {
          asset_id: "1.3.1148",
          should_transfer: 0,
          transferred: 5800
        },
        {
          asset_id: "1.3.1149",
          should_transfer: 0,
          transferred: 14632
        },
        {
          asset_id: "1.3.1150",
          should_transfer: 29042709,
          transferred: 57234907
        },
        {
          asset_id: "1.3.1151",
          should_transfer: 29042709,
          transferred: 233307
        }
      ]
    };
  },
  computed: {
    ...mapGetters({
      username: "auth/username",
      coinMap: "user/coins",
      icons: "user/icons"
    }),
    iconsMap() {
      console.log("icons", this.icons);
      return this.icons || [];
    }
  },
  methods: {
    async initData(reset = false) {
      if (reset) {
        this.dataList = [];
        this.isLoading = true;
      }
      if (!this.username) return;
      // 初始化所有币列表
      if (!this.coinsList.length) {
        let coinResult = await this.cybexjs.fee_assets();
        if (!coinResult || !coinResult.length) {
          this.showEmpty = true;
          return;
        } else {
          let tmpList = [];
          for (let id of coinResult) {
            const info = await this.cybexjs.queryAsset(id);
            tmpList.push({
              asset_id: id,
              name: info.symbol,
              amount: 0,
              digits: info.precision
            });
          }
          this.dataList = tmpList;
        }
      }
      // 初始化用户数据
      let res = await this.cybexjs.maker_rebate(this.username);
      let userTmpList = [];
      if (res.success) {
        for (let rebate of res.result) {
          let find = findIndex(this.dataList, {asset_id: rebate.asset_id})
          if (find > -1) {
            if (this.dataList[find].digits != 0) {
              const amount = rebate.transferred / Math.pow(10, this.dataList[find].digits);
              Object.assign(this.dataList[find], {amount: amount });
            } else {
              console.error('no valid digits');
              Object.assign(this.dataList[find], {amount: rebate.transferred });
            }
          }
        }
      }
    },
    goTransfer(info) {
      console.log("router to", this.$i18n.path("/fund/transfer/" + info.name));
      this.$router.push(this.$i18n.path("/fund/transfer/" + info.name));
    },
    // goWithdraw(info) {
    //   console.log("router to", this.$i18n.path("/fund/withdraw/" + info.name));
    //   this.$router.push(this.$i18n.path("/fund/withdraw/" + info.name));
    // }
  },
  created() {
    this.initData(false);
  }
};
</script>

<style lang="stylus" scoped>
@require '~assets/style/_vars/_colors';
@require '~assets/style/_fonts/_font_mixin';

.rebate-layout {
  padding: 0 72px;
  min-width: 1296px;
}

.empty {
  padding: 40px;
}

.page-title {
  height: 96px;
  font-size: 24px;
  line-height: 1.17;
  letter-spacing: 0.3px;
  color: $main.white;
  padding: 41px 0 27px 24px;
  margin-bottom: 16px;
  f-cybex-style('heavy');
}

.coin-card-wrapper {
  flex-wrap: wrap;
}

.coin-card {
  f-cybex-style('heavy');
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  margin: 16px;
  display: flex;
  padding: 24px;
  min-width: 260px;
  width: 23%;
  max-width: 23%;
  margin: 1%;
  height: 159px;
  border-radius: 4px;
  box-shadow: 0 8px 8px -4px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 8px 10px 0 rgba(0, 0, 0, 0.2), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 16px 24px 2px rgba(0, 0, 0, 0.14);
  }

  background-color: #1b2230;

  .label-amount {
    color: rgba($main.white, 0.4);
    f-cybex-style('medium');
    margin-bottom: 6px !important;
  }

  .fixed-icons {
    position: absolute;
    right: 22px;
    bottom: 22px;

    .v-icon {
      margin-left: 10px;
      padding: 2px;

      &:hover {
        cursor: pointer;
        border-radius: 2px;
        background: rgba($main.grey, 0.3);
      }
    }

    .rotate-180deg {
      transform: rotate(180deg);
    }
  }
}
</style>