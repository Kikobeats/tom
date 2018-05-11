'use strict'

const nodemailer = require('nodemailer')
const deepMap = require('deep-map')
const Mailgen = require('mailgen')
const { pick } = require('lodash')
const pupa = require('pupa')

const compileTemplate = (template, opts) =>
  deepMap(template, str => pupa(str, opts))

module.exports = ({ config, commands }) => {
  const transporter = nodemailer.createTransport(config.email.transporter)

  const mailGenerator = new Mailgen({
    theme: config.email.theme,
    product: {
      name: config.company.site,
      link: config.company.link,
      logo: config.company.logo,
      copyright: config.company.copyright
    }
  })

  const { templates } = config.email

  const email = async opts => {
    const { template: templateName, to } = opts
    if (!templateName) throw TypeError('Need to specify a `template` to use.')
    if (!to) {
      throw TypeError('Need to specify at least one destination as `to`.')
    }

    const template = templates[templateName]
    if (!template) {
      throw TypeError(`Template '${templateName}' doest not exist.`)
    }

    const templateOpts = Object.assign({}, config, { props: opts })
    const compiledTemplate = compileTemplate(template, templateOpts)

    const templateProps = pick(compiledTemplate, [
      'body',
      'bcc',
      'cc',
      'from',
      'subject'
    ])
    const optsProps = pick(opts, [
      'body',
      'bcc',
      'cc',
      'from',
      'subject',
      'attachments'
    ])
    const mailOpts = Object.assign({}, templateProps, optsProps)

    const { from, subject, body, cc, bcc, attachments } = mailOpts

    if (!from) throw TypeError('Need to specify a `from`.')
    if (!subject) throw TypeError('Need to specify a `subject`.')
    if (!body) throw TypeError('Need to specify a `body`.')

    const html = mailGenerator.generate({ body })
    const text = mailGenerator.generatePlaintext({ body })

    const info = await transporter.sendMail({
      from,
      to,
      cc,
      bcc,
      attachments,
      subject,
      text,
      html
    })

    const logProps = pick(mailOpts, [
      'from',
      'subject',
      'cc',
      'bcc',
      'attachments'
    ])

    const log = Object.assign({}, { to }, logProps, {
      preview: nodemailer.getTestMessageUrl(info)
    })

    return log
  }

  return email
}
