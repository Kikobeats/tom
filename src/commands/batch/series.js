'use strict'

const { noop, get, map } = require('lodash')
const pWaterfall = require('p-waterfall')

const runCommands = (commands, opts) =>
  map(opts, ({ command, ...props }) => {
    const fn = get(commands, command, noop)
    return prevProps => fn({ ...prevProps, ...props })
  })

module.exports = ({ config, commands }) => {
  const series = opts => pWaterfall(runCommands(commands, opts), {})
  return series
}
