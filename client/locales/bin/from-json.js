const fs = require('fs');
const path = require('path');
const { convertToCsv } = require('./convert');

async function main () {
  let fileName
  let localeKeys = ['zh-cn', 'en', 'vn']
  let jsonObjects = {}
  for (let i = 0; i < localeKeys.length; i++) {
    const localeKey = localeKeys[i]
    fileName = path.resolve(__dirname, `../${localeKey}.json`)
    console.log(`read from ${fileName}`)
    let fsStr = fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' })
    jsonObjects[localeKey] = JSON.parse(fsStr)
  }
  const csvLines = await convertToCsv(jsonObjects['zh-cn'], jsonObjects)
  fileName = path.resolve(__dirname, '../locales.csv')
  fs.writeFileSync(fileName, csvLines.join(''), { encoding: 'utf8', flag: 'w' })
  console.log(`write to ${fileName}`)
  console.log(`convert done!`)
  process.exit(0)
}
main()
