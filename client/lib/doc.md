1.async start() 
    选择最快的结点，并连接 

2.async loadBases() 
    在store中设置 bases loadbases 

3.async coin_id2name() 
    在store中设置 coins  coins   id对应名字 

// 以上在初始化的时候调用即可start和coin_id2name 即可 

4.async unlock(user,password,timeout)  
	解锁钱包
return  {
        code: 0,
        userkeys:userkeys
      }

失败 return

      {
        code: 1,
        error: "unlock fail"
      }

解锁后 store.islocked 会等于true

5.   async legal_currency()
  法币价格

  return { "code": 0, "prices": [ { "name": "CYB", "value": 0.04659147274, "time": 1541072605 }, { "name": "BTC", "value": 44056.092370638, "time": 1541072611 }, { "name": "ETH", "value": 1378.5502546165, "time": 1541072611 }, { "name": "USDT", "value": 6.9006544982405, "time": 1541072612 }, { "name": "EOS", "value": 36.231546236056, "time": 1541072612 }, { "name": "XRP", "value": 3.1341199594017, "time": 1541072611 }, { "name": "LTC", "value": 346.32922920528, "time": 1541072611 }, { "name": "NEO", "value": 106.89842467028, "time": 1541072613 } ] }
  失败 return null
  
6. async loadbase(base_id)
   返回某个base的对应市场价

   return [ { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.9", "latest": "53.577309315289647967", "lowest_ask": "53.640261480368671078", "highest_bid": "53.577309315289647967", "percent_change": "0.04", "base_volume": "52450.00125", "quote_volume": "985.112772", "quotename": "NAS" }, { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.28", "latest": "0.754613272080033391", "lowest_ask": "0.754613272080033391", "highest_bid": "0.753677813035022316", "percent_change": "16.56", "base_volume": "15466.74131", "quote_volume": "22496.909368", "quotename": "INK" }, { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.506", "latest": "10.271328041805267375", "lowest_ask": "10.35111293556875334", "highest_bid": "10.260556225792113785", "percent_change": "0.5", "base_volume": "10.22867", "quote_volume": "0.995485", "quotename": "CTXC" }, { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.21", "latest": "1.576713734379741824", "lowest_ask": "1.576020765928131189", "highest_bid": "1.554945455428946281", "percent_change": "-0.77", "base_volume": "6.66863", "quote_volume": "4.132657", "quotename": "GNX" }, { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.5", "latest": "1.320816297714501232", "lowest_ask": "0", "highest_bid": "0", "percent_change": "0", "base_volume": "0", "quote_volume": "0", "quotename": "SNT" }, { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.4", "latest": "176.378387224988894344", "lowest_ask": "188.624966028235899929", "highest_bid": "180.074533620038356482", "percent_change": "0", "base_volume": "0", "quote_volume": "0", "quotename": "EOS" }, { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.6", "latest": "9.257669094909713087", "lowest_ask": "0", "highest_bid": "0", "percent_change": "0", "base_volume": "0", "quote_volume": "0", "quotename": "BAT" }, { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.11", "latest": "16.999999985040386394", "lowest_ask": "16.999999985040386394", "highest_bid": "8.888888001422475106", "percent_change": "0", "base_volume": "0", "quote_volume": "0", "quotename": "PAY" }, { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.23", "latest": "1.236", "lowest_ask": "1.236", "highest_bid": "0.113600000000395256", "percent_change": "0", "base_volume": "0", "quote_volume": "0", "quotename": "TCT" }, { "time": "2018-11-01T11:46:13", "base": "1.3.0", "quote": "1.3.24", "latest": "8.235999894765311624", "lowest_ask": "7.490879075041271818", "highest_bid": "0", "percent_change": "0", "base_volume": "0", "quote_volume": "0", "quotename": "DPY" } ]

  失败 return null

7. async get_user(user) user可以传id或者name
   获取用户信息  return account_info
    不存在 return null

8. async limit_orders(user) 
   当前挂单，链上来的接口
  return limit_orders 

  [ { "id": "1.7.209210823", "expiration": "2018-11-17T19:11:53", "seller": "1.2.28058", "for_sale": 10, "sell_price": { "base": { "amount": 10, "asset_id": "1.3.0" }, "quote": { "amount": 10, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209211091", "expiration": "2018-11-17T19:11:53", "seller": "1.2.28058", "for_sale": 10, "sell_price": { "base": { "amount": 10, "asset_id": "1.3.0" }, "quote": { "amount": 10, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209212976", "expiration": "2023-10-18T04:01:41", "seller": "1.2.28058", "for_sale": 100000, "sell_price": { "base": { "amount": 100000, "asset_id": "1.3.0" }, "quote": { "amount": 153, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209219010", "expiration": "2018-11-17T19:11:53", "seller": "1.2.28058", "for_sale": 10, "sell_price": { "base": { "amount": 10, "asset_id": "1.3.0" }, "quote": { "amount": 10, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209219643", "expiration": "2018-11-17T19:11:53", "seller": "1.2.28058", "for_sale": 10, "sell_price": { "base": { "amount": 10, "asset_id": "1.3.0" }, "quote": { "amount": 10, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209221503", "expiration": "2018-11-17T19:11:53", "seller": "1.2.28058", "for_sale": 10, "sell_price": { "base": { "amount": 10, "asset_id": "1.3.0" }, "quote": { "amount": 10, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209222285", "expiration": "2018-11-17T19:11:53", "seller": "1.2.28058", "for_sale": 10, "sell_price": { "base": { "amount": 10, "asset_id": "1.3.0" }, "quote": { "amount": 10, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209222423", "expiration": "2018-11-17T19:11:53", "seller": "1.2.28058", "for_sale": 10, "sell_price": { "base": { "amount": 10, "asset_id": "1.3.0" }, "quote": { "amount": 10, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209222676", "expiration": "2018-11-17T19:11:53", "seller": "1.2.28058", "for_sale": 10, "sell_price": { "base": { "amount": 10, "asset_id": "1.3.0" }, "quote": { "amount": 10, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209288524", "expiration": "2023-10-17T21:10:39", "seller": "1.2.28058", "for_sale": 100, "sell_price": { "base": { "amount": 100, "asset_id": "1.3.0" }, "quote": { "amount": 1000000, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209290159", "expiration": "2023-10-17T21:12:04", "seller": "1.2.28058", "for_sale": 100000, "sell_price": { "base": { "amount": 100000, "asset_id": "1.3.0" }, "quote": { "amount": 1000, "asset_id": "1.3.2" } }, "deferred_fee": 55 }, { "id": "1.7.209290341", "expiration": "2023-10-17T21:12:14", "seller": "1.2.28058", "for_sale": 100000, "sell_price": { "base": { "amount": 100000, "asset_id": "1.3.0" }, "quote": { "amount": 1000, "asset_id": "1.3.2" } }, "deferred_fee": 55 } ]

9. async get_market_history( asset_a, asset_b, bucket_seconds, start, end)
  // bucket_seconds  [15,60,300,3600,86400]
  // 只保留几个维度各1000条数据
  // start,end utc 时间格式，'2018-05-01T00:00:00'
  return 
  [ { "id": "5.1.73848", "key": { "base": "1.3.0", "quote": "1.3.2", "seconds": 86400, "open": "2018-05-01T00:00:00" }, "high_base": "5059288537", "high_quote": 25600000, "low_base": "3076078959", "low_quote": 17644388, "open_base": 158953511, "open_quote": 909198, "close_base": 19411504, "close_quote": 109400, "base_volume": "20864813249", "quote_volume": 114872012 },...]

10. async lowhigh(asset_a,asset_b)
  24小时最高价，最低价
  return 
      [_.max(x),_.min(x)]

11. async verify_code() 
  获取注册验证码
  id 用于标识，注册时传入.data用于验证码。
  return 
  {
    id:"",
    data:""
  }

12. async register(user, password, code_id, code) 
    注册用户，code_id 是验证码接口返回的id，code是用户输入的验证码
    return hr.data
  
13. async cancel_order(order_id)
    取消订单  
    return txid
    失败return null

14. async limit_order_create(base_id, quote_id, side, price, amount,fee_asset_id = "1.3.0",total=null)
    挂单，side = buy|sell
    price,amount 是 number
    如果需要准确挂单，就传amount和total，不要传price
    return txid
     失败return null

15. async transfer({
    to,
    amount,
    memo,
    locktime, //seconds
    asset,
    fee_asset_id='1.3.0'
    // is_send = true
  })

    转账
    //
        to: "yangyu123",
        amount: 0.01,
        asset: "CYB",
        memo: "你好"
    return txid

    失败 return null

16.  async get_deposit(assetShort,username)
    获取充值地址。
    assetShort 是 CYB ETH 等，是cybex 的 aseet JADE.ETH ，去掉前缀
    username 是用户名  ，如 yangyu1
    return 
    { "data": { "getDepositAddress": { "address": "0x9a8c8edf90f94f09775e9d90aea273cee675732b", "accountName": "yangyu1", "asset": "TEST.ETH", "type": "ETH", "createAt": "2018-10-19T02:51:33.360Z", "__typename": "AccountAddressRecord" } } }
    eos的address是特殊的
    { "data": { "getDepositAddress": { "address": "awesome11[rJ8SoHYhm]", "accountName": "yangyu1", "asset": "TEST.EOS", "type": "EOS", "createAt": "2018-11-02T03:57:50.518Z", "__typename": "AccountAddressRecord" } } }
    
    "address": "awesome11[rJ8SoHYhm]"   awesome11是eos充值账户，rJ8SoHYhm是memo
17. //只用16就可以了
    async get_deposit_eos(username) 
    获取eos充值地址，eos是特殊的
    return
    { "data": { "getDepositAddress": { "address": "awesome11[rJ8SoHYhm]", "accountName": "yangyu1", "asset": "TEST.EOS", "type": "EOS", "createAt": "2018-11-02T03:57:50.518Z", "projectInfo": { "projectName": "EOS", "logoUrl": "https://static-assets.51nebula.com/asset-symbols/EOS.png", "contractAddress": null, "contractExplorerUrl": null, "__typename": "ProjectInfo" }, "__typename": "AccountAddressRecord" } } }

18. async new_deposit(assetShort, username)
    刷新充值地址
    assetShort 是 CYB ETH 等，是cybex 的 aseet JADE.ETH ，去掉前缀
    username 是用户名  ，如 yangyu1
    return 
    { "data": { "newDepositAddress": { "address": "0xce98ba4ffada57e8498be0a9dea3d61e1d26391a", "accountName": "yangyu1", "asset": "TEST.ETH", "type": "ETH", "createAt": "Fri Nov 02 2018 11:10:11 GMT+0800 (CST)", "__typename": "AccountAddressRecord" } } }
    EOS是特殊的
    { "data": { "newDepositAddress": { "address": "awesome11[SJkw2HKh7]", "accountName": "yangyu1", "asset": "TEST.EOS", "type": "EOS", "createAt": "2018-11-02T04:02:31.096Z", "__typename": "AccountAddressRecord" } } }


19. async withdraw_info(assetShort)
    提现信息
    assetShort 是 CYB ETH 等，是cybex 的 aseet JADE.ETH ，去掉前缀
    return 
    { "data": { "withdrawInfo": { "fee": 0.005, "minValue": 0.015, "precision": null, "asset": "TEST.ETH", "type": "ETH", "gatewayAccount": "1.2.32", "__typename": "WithdrawInfo" } } }
    失败
    return null

20. async withdraw(assetShort, coin_symbol, amount, addr)
    提现到地址
    assetShort 是 CYB ETH 等，是cybex 的 aseet JADE.ETH ，去掉前缀
    coin_symbol 是cybex中的asset.symbol 如 JADE.EOS
    amount 是数量
    addr 是提现到地址， 特殊的EOS的地址是 someone[memo]

    return txid
    失败 报错
    return null

21. async findBase(id1, id2)
    传入 两个asset_id ,如果交易对存在，返回base_id，否则返回null
    return base_id

22. async fillorder_history(user, start, end, page, limit, base_id, quote_id)
    成交历史
      user 支持 name 和 id
     // start,end  UTC时间 2017-07-08 ,精确到天,或者都传null是所有时间
     page 从 0 开始
     limit 默认20，不要大于50.
     base_id，quote_id 可以同时不传，表示所有交易对。必须成对传或者不传。 这里传反也会返回正确的值。
     return 
     [ { "time": "2018-10-16T03:17:00", "market": { "base": "1.3.27", "quote": "1.3.0" }, "tradetype": "sell", "price": 30.64098916025534, "base_amount": "0.186259", "quote_amount": "5.70716", "fee": { "amount": "0.000000", "asset_id": "1.3.27" } }, { "time": "2018-10-16T03:17:00", "market": { "base": "1.3.27", "quote": "1.3.0" }, "tradetype": "sell", "price": 30.769388522404896, "base_amount": "0.146285", "quote_amount": "4.50110", "fee": { "amount": "0.000000", "asset_id": "1.3.27" } }, { "time": "2018-10-16T03:14:00", "market": { "base": "1.3.27", "quote": "1.3.0" }, "tradetype": "sell", "price": 30.37270295232332, "base_amount": "0.125596", "quote_amount": "3.81469", "fee": { "amount": "0.000000", "asset_id": "1.3.27" } }, { "time": "2018-10-16T03:12:36", "market": { "base": "1.3.27", "quote": "1.3.0" }, "tradetype": "sell", "price": 30.372736067243686, "base_amount": "0.156089", "quote_amount": "4.74085", "fee": { "amount": "0.000000", "asset_id": "1.3.27" } } ]

23. async queryAsset(coin) 
    coin 是 id 或者  symbol
    return asset 对象
{ "id": "1.3.2", "symbol": "JADE.ETH", "precision": 6, "issuer": "1.2.29", "options": { "max_supply": "1000000000000000", "market_fee_percent": 0, "max_market_fee": 0, "issuer_permissions": 79, "flags": 2, "core_exchange_rate": { "base": { "amount": 100000000, "asset_id": "1.3.0" }, "quote": { "amount": 1000000, "asset_id": "1.3.2" } }, "whitelist_authorities": [], "blacklist_authorities": [ "1.2.40540" ], "whitelist_markets": [], "blacklist_markets": [], "description": "{\"main\":\"Ethereum, founded by Vitalik Buterin, created an alternative protocol for building decentralized applications, by building what is essentially the ultimate abstract foundational layer: a blockchain with a built-in Turing-complete programming language, allowing anyone to write smart contracts and decentralized applications where they can create their own arbitrary rules for ownership, transaction formats and state transition functions. \\n\\n以太坊（Ethereum）是有图灵完备的智能合约功能的公有区块链，Vitalik Buterin 是其创始人。以太坊通过建立终极的抽象的基础层 — 内置有图灵完备编程语言的区块链，使得任何人都能够创建合约和去中心化应用并在其中设立他们自由定义的所有权规则、交易方式和状态转换函数。\",\"market\":\"\"}", "extensions": [] }, "dynamic_asset_data_id": "2.3.2" }

新需求

24. async genPassword()
    推荐密码
    return newpassword

25. async deposit_list()
    充值列表
    return
    [{
	"id": "1.3.2",
	"enable": true,
	"enMsg": "",
	"cnMsg": "",
	"enInfo":"Quickly and easily deposit funds into your Cybex account\nThis service is provided by Cybex gateway\nThe same asset recharge address of the same account must be separated by five minutes before it can be regenerated\nCoins will be deposited immediately after 40 network confirmations\nSend only ETH to this deposit address. Sending any other coin or token to this address may result in the loss of your deposit",
	"cnInfo":"您可以快速方便的充入资金到您的Cybex账户中\n瑶池（Jadepool）作为Cybex推荐的网关将为您提供这一服务\n同一账户同一资产充值地址需间隔五分钟才可重新生成\n使用ETH地址充值需要40个网络确认才能到账\n禁止向ETH地址充值除 ETH之外的资产，任何充入 ETH 地址的非 ETH资产将不可找回"
},...]
26. async withdraw_list()
    return 
    [{
	"id": "1.3.2",
	"enable": true,
	"enMsg": "",
	"cnMsg": "",
	"enInfo": "You are going to withdraw assets from your Cybex account to your external ETH account. \nThe withdrawal service is not free, Cybex gateway will charge the service fee. \nPlease make sure that your withdrawal address is correct, otherwise you may lose your tokens permanently. \nIt may take some time for each transfer to confirm, please kindly be patient. \nPlease use your personal wallet address only. Any smart contract address, exchange deposit address or ICO related address used for withdrawal could result in failed contract execution and transfer.",
    "cnInfo": "您将提出您的ETH到外部地址。\n瑶池（Jadepool）作为Cybex推荐的网关将为您提供这一服务。 \n网关执行手续费将以您希望取出的目标资产支付，并从您提取金额中扣除\n提现过程中还将执行一次Cybex内盘转账，该部分手续费使用CYB支付，如果CYB余额不足，将使用您希望取出的目标资产支付 \n* 请务必确认您的提币地址正确，一旦填写错误，您的资产将丢失 \n* 所有出入金到账需要一定时限，请耐心等待 \n提币操作请使用您的个人钱包地址。提币到合约地址、交易所地址、ICO项目地址可能会发生合约执行失败，将导致转账失败，资产将退回到您的Cybex账户，处理时间较长，请您谅解"
}, ...]

27. async balances(user,coin_id)
    用户资产列表
    return 
    [
      {
        "asset_type": "1.3.0",
        "balance": 8755900,
        "id": "2.5.11788",
        "owner": "1.2.28058"
      }
    ]
    如果coin_id传了
    要么是
     {
        "asset_type": "1.3.0",
        "balance": 8755900,
        "id": "2.5.11788",
        "owner": "1.2.28058"
      }
      如果不存在
      返回null
   async frozenBalances 类似，只是返回冻结的balance。
28. async assetAmount(assetid, amount) 
    转化链上amount为实际amount
    return 实际amount，可能为小数

29. async lock()
    锁定账户

30. async asset_icon(asset_id)
    return url

31. async checkAddress(coin_type,account,address)
    return true
      or false
      or null  （出错的时候）

32. async tradefee(user_id,sell_coin_id)   
return  
 [{amount: "0.00055"
asset_id: "1.3.0"},
{amount: "0.00055"
asset_id: "1.3.2"}]

33.  async calAmountAndFee(uname, amount, coin_id,addr)
  // 提现金额计算
  return 
  {"gatewayfee":{"asset_id":"TEST.ETH","amount":0.005},"cybexfee":{"asset_id":"1.3.53","amount":"0.020000"},"withdraw_amount":99.98,"real_amount":99.97500000000001}

  gatewayfee: 网关手续费
  cybexfee : cybex链手续费
  withdraw_amount: 实际提现金额
  real_amount: 预计到账金额

34. async loadConfigedAssets()
  // 交易所支持的所有资产

35. async queryLocked()
    // 返回锁定期资产，必须先解锁
    return 
    [{"id":"1.15.124","owner":"CYBLxH2HAeZCLdSgPaxE4dSSKgXVKboF1XQv","sender":"1.2.141","balance":{"amount":1000000,"asset_id":"1.3.0"},"state":0,"vesting_policy":{"begin_timestamp":"2018-11-06T07:59:45","vesting_cliff_seconds":259200,"vesting_duration_seconds":259200,"begin_balance":1000000},"last_claim_date":"1970-01-01T00:00:00"}...]

36.  async getTotalBalance(user)
    // 返回可用余额和总余额,分别人民币计价，cyb计价
    return [useful,all,CYBuseful,CYBAll]


37. async getDepth(base_id,quote_id,precision,num)
    precision,希望的精度,根据币种不同。
    num, 返回的买卖单条数，不超过50。

    return null  //错误时，会有日志
    return {}  // 没有数据时
    return   {"asks":[["215.62","4.99373500","1076.71763113"],["215.86","0.10729000","23.15877400"],["218.32","0.63274900","138.14087322"],["219.05","0.10837400","23.73921700"],["219.41","4.76768900","1046.03242156"],["219.69","0.12607700","27.69767900"],["220.34","7.10703200","1565.94320000"],["220.76","0.98099800","216.56400800"],["221.41","0.97116100","215.02462600"],["222.07","0.96954700","215.30049400"]],"bids":[["215.16","5.47449600","1177.92036679"],["215.07","6.13472600","1319.44882398"],["214.66","6.17790500","1326.16999098"],["214.21","0.09594700","20.55291200"],["213.84","2.85257000","610.01410531"],["213.83","0.71996300","153.94989100"],["213.74","0.09040900","19.32449900"],["213.62","0.67227400","143.61783200"],["213.54","5.90563900","1261.09127998"],["213.43","0.10166200","21.69872400"]],"time":"2018-11-21T06:43:02.027662Z","price":"215.61378343"}

    卖单从低到高，买单从高到低。按离成交价顺序。

38. async getOpenOrder(user_id,base_id,quote_id)
    base_id ,quote_id ，可以不传，要传必须都传
    return 
     [{"id":"1.7.72056","time":"2018-11-08T06:27:10","tradetype":"sell","market":{"base":"1.3.0","quote":"1.3.2"},"price":1,"amount":"1.000000","filled":0.5,"total":"1.00000"}]

39. async getClosedOrder(user_id,start,end,limit,lastid,base_id,quote_id,white_flag)
    user_id 必传
    start,end 格式为UTC时间 如 2018-11-08T03:38:01，可以不传
    limit 默认20
    lastid 是如 "1.7.20000",用于翻页，第一页可以不传
    base_id 和quote_id 可以不传，必须同时传或者不传
    white_flag "in" or "out" 或者不传。 表示官方交易对内或者外。  只有base_id，quote_id null的时候起作用.
    return
   [{"id":"1.7.25521","time":"2018-11-06T10:18:20","tradetype":"buy","market":{"base":"1.3.0","quote":"1.3.2"},"price":1,"amount":"1.000000","filled":"1.000000","total":"1.00000","average":1,"status":"Filled"},{"id":"1.7.25406","time":"2018-11-06T10:12:05","tradetype":"buy","market":{"base":"1.3.0","quote":"1.3.2"},"price":1,"amount":"1.000000","filled":"5.549884","total":"1.00000","average":0.18018394618698338,"status":"Filled"}]

40.  async gatewayRecord(offset,size,fundtype,asset)
    解锁后才可调用
    offset 默认 0， 偏移量
    size 默认50， 返回条数
    fundtype 可不传，可以传 WITHDRAW | DEPOSIT
    asset 可以传id 1.3.x，或者name 如 JADE.ETH
    return {
  		total: int;		// 符合查询的条目数量
  		size: int;		// 当前数据集尺寸
  		offset: int;	// 本次返回的数据的偏移量
  		records: Record[]	// 数据集
  	}
    Record: {
  	accountName: string;	// 用户名
  	address: string;		// 外部地址/EOS用户名
  	amount: int;			// 资产数量
  	asset: string;			// 资产名称
  	coinType: string;		// 外部资产名称
  	fundType: string;		// 操作类型 WITHDRAW/DEPOSIT 
  	state: string;			// 订单状态 new | init | pending | failed | done
  	updateAt: ISODateString; // 最近状态更新时间，ISO格式时间字串
  }

  41.  async assetValue(coin_id, amount,settle_id_or_symbol)
    返回资产法币价格，或者以settle_id_or_symbol 结算的价格。
    settle_id_or_symbol 可选，传入CYB，TEST.ETH,或者1.3.0 ，作为清算货币，否则以CNY结算
    return settle_amount  ,比如 10.
    当资产无法定价时，即无法找到交易对，或者交易对无成交价来判断价格。return -1.

42. async fake_tr_memo_fee(memo,fee_asset_id="1.3.0")
    伪造查询带memo的转账手续费
    return {"amount":"0.01000","asset_id":"1.3.0"}

43. async top_asset()
    返回置顶的资产id
    return ["1.3.0","1.3.3","1.3.2","1.3.23"]
  
44. async report(e)

45. async claim_balance(balance_id,asset_id,amount)
    claim 解锁资产
    balance_id,asset_id,amount 都在获取锁定资产中。
    return id

46. async deposit_infos(coin)
    coin 支持id，symbol
    return 见 http://47.91.242.71:3039/json/deposit/1.3.3.json
    可能throw error   S.config_TEST.ETH.deposit_infos  ,币种可能不同

46. async withdraw_infos(coin)
    coin 支持id，symbol
    return 见 http://47.91.242.71:3039/json/withdraw/1.3.3.json
    可能throw error   S.config_TEST.ETH.withdraw_infos  ,币种可能不同

47.  async allMarket(coin="ETH")
    返回某个币种的全网交易量，按coin计价
    return 155403.12266999265   cointype

48. async  gatewayAsset(fundtype, asset_id)
    网关用户充提币种
    fundtype 可不传，可以传 WITHDRAW | DEPOSIT
    asset 可以传id 1.3.x，或者name 如 JADE.ETH

    return  {"total":1,"offset":0,"size":1,"records":[{"count":4,"groupInfo":{"asset":"TEST.ETH"}}]}
49. async suggest_account(name)
    return [["yangyu1", "1.2.28058"],["yangyu123", "1.2.27976"]]

50. async suggest_asset (string) 
  return [
    {
dynamic_asset_data_id: "2.3.1",
id: "1.3.1",
issuer: "1.2.29",
options: {max_supply: "1000000000000000", market_fee_percent: 0, max_market_fee: 0, issuer_permissions: 79, flags: 0, …},
precision: 6,
symbol: "JADE"
  }...]