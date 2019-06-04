'use strict'

const test = require('ava')

const createConfig = require('../../_create-config')
const createTom = require('../../../')

test('notification:email', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('notification:email', data => {
      t.is(data.to, to)
      t.is(data.from, config.company.email)
      t.is(data.bcc, config.company.email)
      t.is(data.subject, 'Welcome to tom.js.org')
    })
  })

  const tom = createTom(config)
  const templateId = 'payment_success'
  const to = 'kiko@microlink.io'

  await tom.notification.email({ to, templateId })
})
