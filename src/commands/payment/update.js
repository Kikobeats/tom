'use strict'

const createStripe = require('stripe')
const { get } = require('lodash')

const { wardCredential, ward, is } = require('../../ward')

module.exports = ({ config, commands }) => {
  const errFn = wardCredential(config, {
    key: 'payment.stripe_key',
    env: 'TOM_STRIPE_KEY'
  })
  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))
  const { email: sendEmail } = commands.notification

  const payment = async ({ token, customerId, templateId }) => {
    ward(token, { label: 'token', test: is.object })
    ward(token.source, { label: 'token.source', test: is.object })
    ward(customerId, { label: 'customerId', test: is.string.nonEmpty })

    const { id: source } = token
    await stripe.customers.update(customerId, { source })

    const { email } = await stripe.customers.retrieve(customerId)
    ward(email, {
      label: 'email',
      test: is.string.nonEmpty,
      message: `Not found the 'email' associated with the customer.`
    })

    const logEmail = templateId
      ? await sendEmail({ templateId, to: email }, { printLog: false })
      : {}
    const log = { customerId, email, ...logEmail }

    return { log }
  }

  return payment
}
