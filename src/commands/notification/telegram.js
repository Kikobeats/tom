'use strict'

const fetch = require('node-fetch')

const { ward, is } = require('../../ward')

module.exports = ({ config }) => {
  const baseUrl = `https://api.telegram.org/bot${config.telegram.token}/sendMessage`

  const telegram = async ({ message, chatId }) => {
    ward(chatId, { label: 'chatId', test: is.number })

    const url = encodeURI(`${baseUrl}?chat_id=${chatId}&text=${message}`)
    const response = await fetch(url)
    const data = await response.json()

    return { log: data.result }
  }

  return telegram
}
