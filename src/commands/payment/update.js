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

  const payment = async ({ token, customerId, templateId }) => {
    ward(token, {
      label: 'token',
      test: is.object.is(token => !!token.id),
      message: `Need to provide a Stripe token object: https://stripe.com/docs/api/tokens/object.`
    })

    ward(customerId, { label: 'customerId', test: is.string.nonEmpty })

    const { id: source, client_ip: clientIp } = token
    const metadata = clientIp ? await meta(clientIp) : undefined
    await stripe.customers.update(customerId, {
      metadata,
      source
    })

    const { email } = await stripe.customers.retrieve(customerId)

    ward(email, {
      label: 'email',
      test: is.string.nonEmpty,
      message: `The customer id \`${customerId}\` doesn't have an email associated.`
    })

    return { customerId, email }
  }

  return payment
}
