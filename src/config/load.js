'use strict'

const cosmiconfig = require('cosmiconfig').cosmiconfig('tom')

module.exports = async (cwd = process.cwd()) => {
  const { config } = (await cosmiconfig.search(cwd)) || {}
  return config
}
