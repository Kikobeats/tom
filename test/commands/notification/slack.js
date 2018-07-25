'use strict'

const test = require('ava')

const createConfig = require('../../helpers/create-config')
const createTom = require('../../../')

test('notification:slack', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('notification:slack', data => {
      t.is(data, 'ok')
    })
  })

  const tom = createTom(config)
  const text = 'Someone is running the tests 🙀'

  await tom.notification.slack({ text })
})
