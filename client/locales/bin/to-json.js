const fs = require('fs');
const path = require('path');
const { convertToJson } = require('./convert');

async function main () {
  let fileName = path.resolve(__dirname, '../locales.csv')
  console.log(`read from ${fileName}`)
  let fsStr = fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' })
  const result = await convertToJson(fsStr)
  for (const key in result) {
    const objToSave = result[key]
    fileName = path.resolve(__dirname, `../${key}.json`)
    fs.writeFileSync(fileName, JSON.stringify(objToSave, null, 2), { encoding: 'utf8', flag: 'w' })
    console.log(`write to ${fileName}`)
  }
  console.log(`convert done!`)
  process.exit(0)
}
main()
