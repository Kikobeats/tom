'use strict'

const { get } = require('lodash')
const got = require('got')

const { ward, wardCredential, is } = require('../../ward')
const compile = require('../../compile')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, {
    key: 'telegram.token',
    env: 'TOM_TELEGRAM_KEY'
  })
  if (errFn) return errFn

  const template = get(config, 'telegram.template')
  const token = get(config, 'telegram.token')

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`

  const telegram = async (opts, { printLog = true } = {}) => {
    const { chatId, text } = compile({
      config,
      opts,
      pickProps: ['chatId', 'text'],
      template: get(template, opts.templateId)
    })

    ward(chatId, { label: 'chatId', test: is.number })
    ward(text, { label: 'text', test: is.string.nonEmpty })
    const query = { chat_id: chatId, text }
    const { body } = await got(endpoint, { json: true, query })
    return { log: body.result, printLog }
  }

  return telegram
}
