'use strict'

const { noop, get, map } = require('lodash')
const pWaterfall = require('p-waterfall')

const runCommands = (cmd, commands, opts) =>
  map(commands, ({ command, ...props }) => {
    const fn = get(cmd, command, noop)
    return prevProps => fn({ ...opts, ...prevProps, ...props })
  })

module.exports = ({ config, commands: cmd }) => {
  const series = (commands, opts) => {
    if (commands.commands) {
      const { commands: _commands, ..._opts } = commands
      commands = _commands
      opts = _opts
    }
    return pWaterfall(runCommands(cmd, commands, opts), {})
  }
  return series
}
