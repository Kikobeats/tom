'use strict'

const importModules = require('import-modules')
const { reduce, mapValues } = require('lodash')
const path = require('path')

const withAction = require('./interface/action')
const createConfig = require('./config/create')

const COMMANDS_PATH = path.join(__dirname, 'commands')

const COMMANDS = ['notification', 'payment', 'batch']

const loadCommand = (cmdName, { config, commands }) => {
  const actions = importModules(path.join(COMMANDS_PATH, cmdName))

  return mapValues(actions, (actionFn, actionName) => {
    const eventName = `${cmdName}:${actionName}`
    const fn = actionFn({ commands, config })
    return withAction({ fn, eventName, tom: config })
  })
}

module.exports = rawConfig => {
  const config = createConfig(rawConfig)
  return reduce(
    COMMANDS,
    (acc, cmdName) => {
      const cmd = loadCommand(cmdName, { commands: acc, config })
      return { ...acc, [cmdName]: cmd }
    },
    {}
  )
}

module.exports.listen = require('../bin/listen')
module.exports.createConfig = createConfig
