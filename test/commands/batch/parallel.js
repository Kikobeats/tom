'use strict'

const { faker } = require('@faker-js/faker')
const test = require('ava')

const { authEmailForTesting, createConfig } = require('../../helpers')
const createTom = require('../../../')

test.before(authEmailForTesting)

test('batch:parallel', async t => {
  let count = 0
  const config = createConfig(({ config, tom }) => {
    tom.on('notification:email', data => {
      ++count
    })
  })

  const tom = createTom(config)

  const commands = [
    {
      command: 'notification.email',
      templateId: 'payment_success',
      to: faker.internet.exampleEmail()
    },
    {
      command: 'notification.email',
      templateId: 'payment_success',
      to: faker.internet.exampleEmail()
    },
    {
      command: 'notification.email',
      templateId: 'payment_success',
      to: faker.internet.exampleEmail()
    }
  ]

  await tom.batch.parallel(commands)
  t.is(count, 3)
})
