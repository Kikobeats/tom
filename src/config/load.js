'use strict'

const cosmiconfig = require('cosmiconfig')('tom')

module.exports = async (cwd = process.cwd()) => {
  let { config } = (await cosmiconfig.search(cwd)) || {}
  return config
}
