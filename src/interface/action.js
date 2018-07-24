'use strict'

const { split, first, reduce } = require('lodash')
const pRetry = require('p-retry')

const printError = require('../log/print-error')
const createLog = require('../log/create-log')

const toObject = arr => reduce(arr, (acc, obj) => ({ ...acc, ...obj }), {})

const eventDomain = eventName => first(split(eventName, ':'))

module.exports = ({ eventName, fn, tom }) => {
  const log = createLog({ keyword: eventName })

  return async (params, opts) => {
    try {
      const run = () => fn(params, opts)
      const { log: data, printLog = true } = await pRetry(run, { retries: 3 })

      const meta = await Promise.all([
        tom.emit('*', data),
        tom.emit(eventDomain(eventName), data),
        tom.emit(eventName, data)
      ])

      const output = reduce(
        meta,
        (acc, obj) => ({ ...acc, ...toObject(obj) }),
        data
      )
      if (printLog) log.debug(output)
      return output
    } catch (err) {
      printError({ log, err })
      throw err
    }
  }
}
