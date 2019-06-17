import '~/static/datafeeds/udf/dist/polyfills.js'
import '~/static/datafeeds/udf/dist/bundle.js'

export default async () => {
  if (!process.client) return
  await import('~/assets/tradingview/charting_library.min')
}
