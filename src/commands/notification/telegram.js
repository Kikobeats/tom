'use strict'

const got = require('got')

const { ward, is } = require('../../ward')

module.exports = ({ config }) => {
  const baseUrl = `https://api.telegram.org/bot${config.telegram.token}/sendMessage`

  const telegram = async ({ message, chatId }) => {
    ward(chatId, { label: 'chatId', test: is.number })

    const response = await got(baseUrl, {
      json: true,
      query: {
        chat_id: chatId,
        text: message
      }
    })

    return { log: response.body.result }
  }

  return telegram
}
