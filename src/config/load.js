'use strict'

const JoyCon = require('joycon')

const joycon = new JoyCon({
  packageKey: 'tom',
  files: ['package.json', '.tomrc', '.tomrc.json', '.tomrc.js', 'tom.config.js']
})

module.exports = async (cwd = process.cwd()) => {
  const { data: config } = await joycon.load()
  return config
}
