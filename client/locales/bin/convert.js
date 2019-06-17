const _ = require('lodash')
const csv = require('csv')

const delimiter = ','

const flattenObject = (obj, path) => {
  if (!_.isObject(obj)) return obj
  let result = {}
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue
    const val = obj[key]
    const newKey = path ? `${path}.${key}` : key
    if (!_.isObject(val)) {
      result[newKey] = val
    } else {
      const subObj = flattenObject(val, newKey)
      _.assign(result, subObj)
    }
  }
  return result
}

/**
 * 输出CSV格式的记录
 * @param {object} keyObject
 * @param {object} jsonObjects
 */
async function convertToCsv (keyObject, jsonObjects) {
  const flattened = flattenObject(keyObject)
  const localeKeys = _.keys(jsonObjects)
  let records = []
  // add title
  records.push(['category', 'id', ...localeKeys].join(delimiter) + '\n')
  for (const key in flattened) {
    const keyArr = _.split(key, '.')
    let line = [keyArr.shift(), keyArr.join('.')]
    for (let i = 0; i < localeKeys.length; i++) {
      const localeKey = localeKeys[i]
      const localeObj = jsonObjects[localeKey]
      line.push(_.get(localeObj, key))
    }
    records.push(line.join(delimiter) + '\n')
  }
  return records
}

/**
 * 输出JSON格式的记录
 * @param {string} lines
 */
async function convertToJson (lines) {
  return new Promise((resolve, reject) => {
    csv.parse(lines, {
      delimiter,
      columns: true,
      skip_empty_lines: true
    }, function (err, records) {
      if (err) {
        reject(err)
      } else {
        resolve(records)
      }
    })
  }).then(records => {
    let obj = {}
    records.forEach(record => {
      const id = record.id
      const category = record.category
      for (const key in record) {
        if (key === 'id' || key === 'category') continue
        _.set(obj, `${key}.${category}.${id}`, record[key])
      }
    });
    return obj
  })
}

module.exports = {
  convertToCsv,
  convertToJson
}
