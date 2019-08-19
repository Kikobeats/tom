'use strict'

const test = require('ava')

const { createConfig } = require('../../helpers')
const createTom = require('../../../')

const { TEST_TELEGRAM_CHAT_ID } = process.env

test('notification:telegram', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('notification:telegram', data => {
      t.is(data.text, text)
      t.is(data.chat.id, chatId)
    })
  })

  const tom = createTom(config)
  const chatId = parseInt(TEST_TELEGRAM_CHAT_ID)
  const text = 'Someone is running the tests 🙀'

  await tom.notification.telegram({ text, chatId })
})
