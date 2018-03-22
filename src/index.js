'use strict'

const importModules = require('import-modules')
const { mapValues } = require('lodash')

const COMMANDS = ['notification', 'payment']

const loadCommand = ({ config, folderPath, commands }) =>
  mapValues(importModules(folderPath), command => command({ commands, config }))

module.exports = config =>
  COMMANDS.reduce((acc, command) => {
    acc[command] = loadCommand({
      folderPath: `./commands/${command}`,
      commands: acc,
      config
    })
    return acc
  }, {})
