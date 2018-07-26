'use strict'

const { isNil, get } = require('lodash')
const got = require('got')

const { ward, is } = require('../../ward')
const compile = require('../../compile')

module.exports = ({ config }) => {
  const template = get(config, 'slack.template')

  const slack = async ({ webhook, ...opts }, { printLog = true } = {}) => {
    ward(webhook, { label: 'webhook', test: is.string.nonEmpty })

    opts.templateId &&
      ward(opts.templateId, {
        label: 'templateId',
        test: is.string.is(x => !isNil(get(template, x)))
      })

    const slackOpts = compile({
      config,
      opts,
      pickProps: ['text', 'attachments'],
      template: get(template, opts.templateId)
    })

    ward(slackOpts.from, { label: 'text', test: is.string.nonEmpty })

    const { body: log } = await got(webhook, {
      body: JSON.stringify(slackOpts)
    })

    return { log, printLog }
  }

  return slack
}
