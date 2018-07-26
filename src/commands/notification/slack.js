'use strict'

const { isNil, get } = require('lodash')
const got = require('got')

const { ward, wardCredential, is } = require('../../ward')
const compile = require('../../compile')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, {
    key: 'slack.webhook',
    env: 'TOM_SLACK_WEBHOOK'
  })
  if (errFn) return errFn

  const endpoint = get(config, 'slack.webhook')

  const { template } = config.slack

  const slack = async (opts, { printLog = true } = {}) => {
    const slackOpts = compile({
      config,
      opts,
      pickProps: ['text', 'attachments'],
      template: get(template, opts.templateId)
    })

    ward(slackOpts.from, { label: 'text', test: is.string.nonEmpty })
    const { body: log } = await got(endpoint, {
      body: JSON.stringify(slackOpts)
    })

    return { log }
  }

  return slack
}
