'use strict'

const { noop, get, map } = require('lodash')
const pReflect = require('p-reflect')

const runCommands = (cmd, commands, opts) =>
  map(commands, ({ command, ...props }) => {
    const fn = get(cmd, command, noop)
    return pReflect(fn({ ...opts, ...props }))
  })

module.exports = ({ config, commands: cmd }) => {
  const parallel = (commands, opts) => {
    if (commands.commands) {
      const { commands: _commands, ..._opts } = commands
      commands = _commands
      opts = _opts
    }

    return Promise.all(runCommands(cmd, commands, opts))
  }
  return parallel
}
