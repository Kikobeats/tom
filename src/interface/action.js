'use strict'

const timeSpan = require('@kikobeats/time-span')({
  format: require('pretty-ms')
})
const { omit, isEmpty, split, first, reduce } = require('lodash')
const { randomUUID } = require('crypto')
const pRetry = require('p-retry')

const printError = require('../log/print-error')
const createLog = require('../log/create-log')

const toObject = arr => reduce(arr, (acc, obj) => ({ ...acc, ...obj }), {})

const eventNamespace = eventName => first(split(eventName, ':'))

module.exports = ({ eventName, fn, tom }) => {
  const log = createLog({ keyword: eventName })

  return async opts => {
    try {
      const run = () => fn(opts)
      let time = timeSpan()
      const data = await pRetry(run, { retries: 2 })

      const meta = await Promise.all([
        tom.emit('*', data),
        tom.emit(eventNamespace(eventName), data),
        tom.emit(eventName, data)
      ])

      time = time()

      const output = reduce(
        meta,
        (acc, obj) => ({ ...acc, ...toObject(obj) }),
        data
      )

      if (!isEmpty(output)) {
        log.debug({ id: randomUUID(), ...omit(output, ['headers']), time })
      }

      return output
    } catch (err) {
      console.log('ERROR', err)
      console.log('ERROR', err.message)
      printError({ log, err })
      throw err
    }
  }
}
