'use strict'

const test = require('ava')

const { authEmailForTesting, createConfig } = require('../../helpers')
const createTom = require('../../../')

test.before(authEmailForTesting)

test('notification:email', async t => {
  t.plan(5)

  const config = createConfig(({ config, tom }) => {
    tom.on('notification:email', async data => {
      t.is(data.to, to)
      t.is(data.from, config.company.email)
      t.is(data.bcc, config.company.email)
      t.is(data.subject, 'Welcome to tom.js.org')
      const html = await fetch(data.preview).then(res => res.text())
      t.true(
        html.includes(
          `Copyright © ${new Date().getFullYear()} tom. All rights reserved.`
        )
      )
    })
  })

  const tom = createTom(config)
  const templateId = 'payment_success'
  const to = 'kiko@microlink.io'

  await tom.notification.email({ to, templateId })
})
