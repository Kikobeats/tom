'use strict'

const { get, isNil } = require('lodash')
const got = require('got')

const { ward, wardCredential, is } = require('../../ward')
const compile = require('../../compile')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, {
    key: 'telegram.token',
    env: 'TOM_TELEGRAM_KEY'
  })
  if (errFn) return errFn

  const templates = get(config, 'telegram.template')
  const token = get(config, 'telegram.token')

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`

  const telegram = async opts => {
    if (opts.templateId) {
      ward(opts.templateId, {
        label: 'templateId',
        test: is.string.is(x => !isNil(get(templates, x))),
        message: `Template '${opts.templateId}' not previously declared.`
      })
    }

    const template = get(templates, opts.templateId)
    const { chatId, text } = compile(template, { config, opts })

    ward(chatId, { label: 'chatId', test: is.number })
    ward(text, { label: 'text', test: is.string.nonEmpty })
    const query = { chat_id: chatId, text }
    const { body } = await got(endpoint, { json: true, query })

    return { ...opts, ...body.result }
  }

  return telegram
}
