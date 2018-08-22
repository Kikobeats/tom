'use strict'

const { noop, get, map } = require('lodash')
const pReflect = require('p-reflect')

const runCommands = (commands, opts) =>
  map(opts, ({ command, ...props }) => {
    const fn = get(commands, command, noop)
    return pReflect(fn(props))
  })

module.exports = ({ config, commands }) => {
  const parallel = async opts => Promise.all(runCommands(commands, opts))
  return parallel
}
