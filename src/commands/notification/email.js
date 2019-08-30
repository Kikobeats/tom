'use strict'

const { pick, isNil, get } = require('lodash')
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

  const templates = get(config, 'email.template')

  const email = async ({ headers, ipAddress, ...opts }) => {
    if (opts.templateId) {
      ward(opts.templateId, {
        label: 'templateId',
        test: is.string.is(x => !isNil(get(templates, x))),
        message: `Template '${opts.templateId}' not previously declared.`
      })
    }

    ward(opts.to, {
      test: is.string.nonEmpty,
      label: 'to',
      message: `Need to specify at least a destination as 'to'.`
    })

    const template = get(templates, opts.templateId)
    const { html, text, ...mailOpts } = compile(template, { config, opts })

    ward(mailOpts.from, { label: 'from', test: is.string.nonEmpty })
    ward(mailOpts.subject, { label: 'subject', test: is.string.nonEmpty })

    const info = await transporter.sendMail({
      ...mailOpts,
      html: html || text || mailGenerator.generate({ body: mailOpts.body }),
      text: text || mailGenerator.generatePlaintext({ body: mailOpts.body })
    })

    return {
      ...pick(mailOpts, ['from', 'bcc', 'subject']),
      ...opts,
      preview: nodemailer.getTestMessageUrl(info)
    }
  }

  return email
}
