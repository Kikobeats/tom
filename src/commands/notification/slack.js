'use strict'

const { get } = require('lodash')
const got = require('got')

const { ward, wardCredential, is } = require('../../ward')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, {
    key: 'slack.webhook',
    env: 'TOM_SLACK_WEBHOOK'
  })
  if (errFn) return errFn

  const endpoint = get(config, 'slack.webhook')

  const slack = async ({ text, attachments }) => {
    ward(text, { label: 'text', test: is.string.nonEmpty })

    const body = JSON.stringify({ text, attachments })
    const response = await got(endpoint, { body })

    return { log: response.body }
  }

  return slack
}
