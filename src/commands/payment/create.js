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

  const payment = async ({ token, planId, templateId }) => {
    ward(token, { label: 'token', test: is.object })
    ward(token.id, { label: 'token.id', test: is.string.nonEmpty })
    ward(token.email, {
      label: 'token.email',
      test: is.string.nonEmpty,
      message: `Need to specify an 'email' to be associated with the customer.`
    })
    ward(planId, {
      label: 'planId',
      test: is.string.nonEmpty,
      message: `Need to specify a 'plan' to use`
    })

    const { email, id: source } = token
    const { id: customerId } = await stripe.customers.create({ email, source })
    const data = await stripe.subscriptions.create({
      customer: customerId,
      plan: planId
    })

    const logEmail = templateId
      ? await sendEmail({ templateId, to: email }, { printLog: false })
      : {}
    const log = { customerId, email, planId: data.plan.id, ...logEmail }

    return { log }
  }

  return payment
}
