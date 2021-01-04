'use strict'

const createStripe = require('stripe')
const { get } = require('lodash')

const { wardCredential, ward, is } = require('../../ward')
const getMetadata = require('../../get-metadata')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, {
    key: 'payment.stripe_key',
    env: 'TOM_STRIPE_KEY'
  })

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))

  const update = async ({ token, customerId, ipAddress }) => {
    ward(token, {
      label: 'token',
      test: is.object.is(token => !!token.id),
      message:
        'Need to provide a Stripe token object: https://stripe.com/docs/api/tokens/object.'
    })

    ward(customerId, { label: 'customerId', test: is.string.nonEmpty })

    const { id: source, client_ip: clientIp } = token

    const [newMetadata, { metadata: oldMetadata, email }] = await Promise.all([
      getMetadata(clientIp || ipAddress),
      stripe.customers.retrieve(customerId)
    ])

    await stripe.customers.update(customerId, {
      source,
      metadata: { ...oldMetadata, ...newMetadata }
    })

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: token.card.id
      }
    })

    ward(email, {
      label: 'email',
      test: is.string.nonEmpty,
      message: `The customer id \`${customerId}\` doesn't have an email associated.`
    })

    return { customerId, email }
  }

  return update
}
