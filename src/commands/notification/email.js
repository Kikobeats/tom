'use strict'

const { isNil, omit, get } = require('lodash')
const nodemailer = require('nodemailer')
const Mailgen = require('mailgen')

const { wardCredential, ward, is } = require('../../ward')
const compile = require('../../compile')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, [
    { key: 'email.transporter.auth.user', env: 'TOM_EMAIL_USER' },
    { key: 'email.transporter.auth.pass', env: 'TOM_EMAIL_PASSWORD' }
  ])

  if (errFn) return errFn

  const transporter = nodemailer.createTransport(
    get(config, 'email.transporter')
  )

  const mailGenerator = new Mailgen({
    theme: get(config, 'email.theme', 'default'),
    product: {
      name: get(config, 'company.site'),
      link: get(config, 'company.link'),
      logo: get(config, 'company.logo'),
      copyright: get(config, 'company.copyright')
    }
  })

  const { template } = config.email

  const email = async (opts, { printLog = true } = {}) => {
    opts.templateId &&
      ward(opts.templateId, {
        label: 'templateId',
        test: is.string.is(x => !isNil(get(template, x)))
      })

    ward(opts.to, {
      test: is.string,
      label: 'to',
      message: `Need to specify at least one destination as 'to'`
    })

    const { html, text, ...mailOpts } = compile({
      config,
      opts,
      pickProps: [
        'html',
        'text',
        'body',
        'from',
        'bcc',
        'cc',
        'to',
        'subject',
        'attachments'
      ],
      template: get(template, opts.templateId)
    })

    ward(mailOpts.from, { label: 'from', test: is.string.nonEmpty })
    ward(mailOpts.subject, { label: 'subject', test: is.string.nonEmpty })

    const info = await transporter.sendMail({
      ...mailOpts,
      html: html || text || mailGenerator.generate({ body: mailOpts.body }),
      text: text || mailGenerator.generatePlaintext({ body: mailOpts.body })
    })

    const log = {
      ...omit(mailOpts, ['body']),
      preview: nodemailer.getTestMessageUrl(info)
    }

    return { log, printLog }
  }

  return email
}
