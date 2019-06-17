var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('decimal.csv')
});

// var countDigits = function(n){
//   var count = 0;
//   while (n * 10 <= 1) {
//     n *= 10;
//     ++count;
//   }
//   return count;
// }
var makeDigits = function(n) {
  let t = 1 / Math.pow(10, n);
  return parseFloat(t).toFixed(n);
}
// console.log(makeDigits(8));
// console.log(countDigits(0.00000001));
let dic = {}
let bases = ["USDT", "CYB", "ETH", "BTC"]
let base_now = null
lineReader.on('line', function (line) {
  // console.log('Line from file:', line);
  let ps = line.split(",")
  if (ps.length > 0 && bases.indexOf(ps[0]) !== -1) {
    console.log('base:', ps[0])
    base_now = ps[0]
    dic[base_now] = {}
  }
  if (base_now) {
    dic[base_now][ps[1]] = {
      "info": {
        "last_price": ps[2],
        "change": ps[3],
        "volume": ps[4]
      },
      "book": {
        "last_price": ps[5],
        "amount": ps[6],
        "total": ps[7],
      },
      "choose": {
        "last_price": ps[8],
        "volume": ps[9]
      },
      "form": {
        "min_trade_amount": ps[10],
        "amount_step": makeDigits(ps[6]),
        "price_step": ps[11],
        "min_order_value": ps[12],
        "total_step": makeDigits(ps[7])
      }
    }
  }
  if (base_now == "CYB" && ps[1] == "KEY") {
    require("fs").writeFileSync("pair.json", JSON.stringify(dic, null, 2))
  }
});