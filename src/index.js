'use strict'

const importModules = require('import-modules')
const {mapValues} = require('lodash')

const commands = importModules('./commands')

module.exports = config => mapValues(commands, command => command(config))
