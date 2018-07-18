'use strict'

const { isNil, omit, get, pick } = require('lodash')
const nodemailer = require('nodemailer')
const deepMap = require('deep-map')
const Mailgen = require('mailgen')
const pupa = require('pupa')

const TEMPLATE_PICK_PROPS = [
  'body',
  'from',
  'bcc',
  'cc',
  'to',
  'subject',
  'attachments'
]

const { ward, is } = require('../../ward')

const compileTemplate = (template, opts) =>
  deepMap(template, str => pupa(str, opts))

module.exports = ({ config }) => {
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

  const { templates } = config.email

  const email = async (opts, { printLog = true } = {}) => {
    ward(opts.template, {
      label: 'template',
      test: is.string.is(x => !isNil(get(templates, x))),
      message: `Need to specify a valid 'template'`
    })
    ward(opts.to, {
      test: is.string,
      label: 'to',
      message: `Need to specify at least one destination as 'to'`
    })

    const template = get(templates, opts.template)
    const templateOpts = { ...config, props: opts }
    const compiledTemplate = compileTemplate(template, templateOpts)

    // assign props in order to replace props over config
    const mailOpts = {
      ...pick(compiledTemplate, TEMPLATE_PICK_PROPS),
      ...pick(opts, TEMPLATE_PICK_PROPS)
    }

    ward(mailOpts.from, { label: 'from', test: is.string })
    ward(mailOpts.subject, { label: 'subject', test: is.string })

    const html = mailGenerator.generate({ body: mailOpts.body })
    const text = mailGenerator.generatePlaintext({ body: mailOpts.body })

    const info = await transporter.sendMail({ ...mailOpts, html, text })
    const log = {
      ...omit(mailOpts, ['body']),
      preview: nodemailer.getTestMessageUrl(info)
    }

    return { log, printLog }
  }

  return email
}
