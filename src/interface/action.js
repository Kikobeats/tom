'use strict'

const printError = require('../log/print-error')
const createLog = require('../log/create')

const { reduce } = require('lodash')

module.exports = ({ eventName, fn, tom }) => {
  const log = createLog({ keyword: eventName })

  return async (params, opts) => {
    try {
      const { log: data, printLog = true } = await fn(params, opts)
      const meta = await tom.emit(eventName, data)
      const output = reduce(meta, (acc, obj) => ({ ...acc, ...obj }), data)
      if (printLog) log.debug(output)
      return output
    } catch (err) {
      printError({ log, err })
      throw err
    }
  }
}
