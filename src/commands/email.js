'use strict'

const nodemailer = require('nodemailer')
const deepMap = require('deep-map')
const Mailgen = require('mailgen')
const pupa = require('pupa')

const isProduction = process.env.NODE_ENV === 'production'

const compileTemplate = (template, opts) => deepMap(template, str => (
  pupa(str, opts)
))

module.exports = config => {
  const transporter = nodemailer.createTransport(config.email.transporter)

  const mailGenerator = new Mailgen({
    theme: config.email.theme,
    product: {
      name: config.company.name,
      link: config.company.link,
      logo: config.company.logo,
      copyright: config.company.copyright
    }
  })

  const {templates} = config.email

  const email = async opts => {
    const {template: templateName, to} = opts
    if (!to) throw TypeError('Need to specify at least one destination as `to`.')
    if (!templateName) throw TypeError('Need to specify a `template` to use.')

    const template = templates[templateName]
    if (!template) throw TypeError(`Template '${templateName}' doest not exist.`)

    const templateOpts = Object.assign({}, config, {props: opts})
    const compiledTemplate = compileTemplate(template, templateOpts)

    const {body, subject: templateSubject} = compiledTemplate
    const { from = config.company.email, subject = templateSubject } = opts

    if (!subject) throw TypeError('Need to specify a `subject`')
    if (!body) throw TypeError('Need to specify a `body`')

    const html = mailGenerator.generate({body})
    const text = mailGenerator.generatePlaintext({body})
    const info = await transporter.sendMail({from, to, subject, text, html})
    const log = { from, to, subject }
    if (!isProduction) Object.assign(log, {preview: nodemailer.getTestMessageUrl(info)})
    return log
  }

  return email
}
