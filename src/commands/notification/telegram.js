'use strict'

const TeleBot = require('telebot')

const { ward, is } = require('../../ward')

module.exports = ({ config }) => {
  const bot = new TeleBot(config.telegram.token)

  const telegram = async ({ message, chat_id }) => {
    ward(chat_id, { label: 'chat_id', test: is.number })

    const log = await bot.sendMessage(chat_id, message)

    return { log }
  }

  return telegram
}
