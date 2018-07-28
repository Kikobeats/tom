'use strict'

const { isEmpty, split, first, reduce } = require('lodash')
const timeSpan = require('time-span')
const prettyMs = require('pretty-ms')
const pRetry = require('p-retry')
const uuidv4 = require('uuid/v4')

const printError = require('../log/print-error')
const createLog = require('../log/create-log')

const toObject = arr => reduce(arr, (acc, obj) => ({ ...acc, ...obj }), {})

const eventDomain = eventName => first(split(eventName, ':'))

module.exports = ({ eventName, fn, tom }) => {
  const log = createLog({ keyword: eventName })

  return async opts => {
    try {
      const run = () => fn(opts)
      let time = timeSpan()
      const data = await pRetry(run, { retries: 3 })

      const meta = await Promise.all([
        tom.emit('*', data),
        tom.emit(eventDomain(eventName), data),
        tom.emit(eventName, data)
      ])

      time = prettyMs(time())

      const output = reduce(
        meta,
        (acc, obj) => ({ ...acc, ...toObject(obj) }),
        data
      )

      if (!isEmpty(output)) log.debug({ id: uuidv4(), ...output, time })

      return output
    } catch (err) {
      printError({ log, err })
      throw err
    }
  }
}
