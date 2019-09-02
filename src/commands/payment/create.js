'use strict'

const createStripe = require('stripe')
const { get } = require('lodash')

const { wardCredential, ward, is } = require('../../ward')
const meta = require('../../meta')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, {
    key: 'payment.stripe_key',
    env: 'TOM_STRIPE_KEY'
  })

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))

  const payment = async ({ token, planId }) => {
    ward(token, {
      label: 'token',
      test: is.object.is(token => !!token.id),
      message: 'Need to provide a Stripe token object: https://stripe.com/docs/api/tokens/object.'
    })

    ward(token.email, {
      label: 'token.email',
      test: is.string.nonEmpty,
      message: 'Need to specify an `email` to be associated with the customer.'
    })
    ward(planId, {
      label: 'planId',
      test: is.string.nonEmpty,
      message: 'Need to specify `planId` previous declared.'
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
