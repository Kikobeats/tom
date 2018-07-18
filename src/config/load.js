'use strict'

const cosmiconfig = require('cosmiconfig')('tom')
const createConfig = require('./create')

module.exports = async (cwd = process.cwd()) => {
  let { config } = (await cosmiconfig.search(cwd)) || {}
  return createConfig(config)
}
