'use strict'

const TeleBot = require('telebot')

const { ward, is } = require('../../ward')

module.exports = ({ config }) => {
  const bot = new TeleBot(config.telegram.token)

  const telegram = async ({ message, chatId }) => {
    ward(chatId, { label: 'chatId', test: is.number })

    const log = await bot.sendMessage(chatId, message)

    return { log }
  }

  return telegram
}
