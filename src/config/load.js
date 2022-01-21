'use strict'

const JoyCon = require('joycon')

module.exports = async (cwd = process.cwd()) => {
  const joycon = new JoyCon({
    cwd,
    packageKey: 'tom',
    files: [
      'package.json',
      '.tomrc',
      '.tomrc.json',
      '.tomrc.js',
      'tom.config.js'
    ]
  })
  const { data: config = {} } = (await joycon.load()) || {}
  return config
}
