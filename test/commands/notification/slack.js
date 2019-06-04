'use strict'

const test = require('ava')

const createConfig = require('../../_create-config')
const createTom = require('../../../')

const { TEST_SLACK_WEBHOOK } = process.env

test('notification:slack', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('notification:slack', data => {
      t.is(data.status, 'ok')
    })
  })

  const tom = createTom(config)
  const text = 'Someone is running the tests 🙀'
  const webhook = TEST_SLACK_WEBHOOK

  await tom.notification.slack({ webhook, text })
})
