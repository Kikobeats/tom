'use strict'

const { noop, get, map } = require('lodash')
const pReflect = require('p-reflect')

const runCommands = (commands, { commandNames, ...opts }) =>
  map(commandNames, ({ command, ...props }) => {
    const fn = get(commands, command, noop)
    return pReflect(fn({ ...opts, ...props }))
  })

module.exports = ({ config, commands }) => {
  const parallel = async opts => Promise.all(runCommands(commands, opts))
  return parallel
}
