'use strict'

const { noop, get, map } = require('lodash')
const pSeries = require('p-series')

const runCommands = (commands, opts) =>
  map(opts, ({ command, ...props }) => {
    const fn = get(commands, command, noop)
    return () => fn(props)
  })

module.exports = ({ config, commands }) => {
  const series = async opts => {
    await pSeries(runCommands(commands, opts))
  }
  return series
}
