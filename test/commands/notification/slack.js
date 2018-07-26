'use strict'

const test = require('ava')

const createConfig = require('../../helpers/create-config')
const createTom = require('../../../')

const { TESTING_SLACK_WEBHOOK } = process.env

test('notification:slack', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('notification:slack', data => {
      t.is(data, 'ok')
    })
  })

  const tom = createTom(config)
  const text = 'Someone is running the tests 🙀'
  const webhook = TESTING_SLACK_WEBHOOK

  await tom.notification.slack({ webhook, text })
})
