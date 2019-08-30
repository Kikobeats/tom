'use strict'

const { isNil, get } = require('lodash')
const got = require('got')

const { ward, is } = require('../../ward')
const compile = require('../../compile')

module.exports = ({ config }) => {
  const templates = get(config, 'slack.template')

  const slack = async ({ webhook, ...opts }) => {
    ward(webhook, { label: 'webhook', test: is.string.nonEmpty })

    if (opts.templateId) {
      ward(opts.templateId, {
        label: 'templateId',
        test: is.string.is(x => !isNil(get(templates, x))),
        message: `Template '${opts.templateId}' not previously declared.`
      })
    }

    const template = get(templates, opts.templateId)
    const slackOpts = compile(template, { config, opts })

    ward(slackOpts.text, { label: 'text', test: is.string.nonEmpty })

    // non interesting response on body
    const { body } = await got(webhook, { body: JSON.stringify(slackOpts) })

    return { ...opts, status: body }
  }

  return slack
}
