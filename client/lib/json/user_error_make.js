var csvtojson = require("csvtojson")

csvtojson().fromFile("user_error.csv").then((data)=>{
  let dic1 = {}
  let dic2 = {}
  for (let v of data){
    if (v.error_all){
      console.log(v.error_all,v.zh,v.en)
      dic1[v.error_all] =v.en 
      dic2[v.error_all] = v.zh
    }
  }
  require("fs").writeFileSync("user_error_en.json", JSON.stringify(dic1, null, 2))
  require("fs").writeFileSync("user_error_zh.json", JSON.stringify(dic2, null, 2))
})