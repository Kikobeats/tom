'use strict'

const { get } = require('lodash')
const got = require('got')

const { ward, wardCredential, is } = require('../../ward')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, {
    key: 'telegram.token',
    env: 'TOM_TELEGRAM_KEY'
  })
  if (errFn) return errFn

  const token = get(config, 'telegram.token')
  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`

  const telegram = async ({ message, chatId }) => {
    ward(chatId, { label: 'chatId', test: is.number })
    ward(message, { label: 'message', test: is.string.nonEmpty })
    const query = { chat_id: chatId, text: message }
    const { body } = await got(endpoint, { json: true, query })
    return { log: body.result }
  }

  return telegram
}
