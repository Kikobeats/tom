'use strict'

const createStripe = require('stripe')
const { get } = require('lodash')

const { wardCredential, ward, is } = require('../../ward')
const meta = require('../../meta')

module.exports = ({ config, commands }) => {
  const errFn = wardCredential(config, {
    key: 'payment.stripe_key',
    env: 'TOM_STRIPE_KEY'
  })

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))

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
      message: `Need to specify a 'planId' to use`
    })

    const { email, id: source, client_ip: clientIp } = token
    const metadata = clientIp ? await meta(clientIp) : undefined
    const { id: customerId } = await stripe.customers.create({
      email,
      source,
      metadata
    })

    const data = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ plan: planId }],
      metadata
    })

    return { customerId, email, planId: data.plan.id }
  }

  return payment
}
