'use strict'

const createStripe = require('stripe')

const { get } = require('lodash')

const { wardCredential, ward, is } = require('../../ward')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, [
    { key: 'payment.stripe_key', env: 'TOM_STRIPE_KEY' }
  ])

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))

  const session = async ({ planId, successUrl, cancelUrl }) => {
    ward(planId, {
      label: 'planId',
      test: is.string.nonEmpty
    })

    const priceId = planId.startsWith('price_')
      ? planId
      : await stripe.prices
        .list({ lookup_keys: [planId], limit: 1 })
        .then(({ data }) => {
          if (!data.length) {
            throw new TypeError(
              `The lookup key '${planId}' doesn't match any active Stripe price`
            )
          }
          return data[0].id
        })

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'required',
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      adaptive_pricing: {
        enabled: true
      },
      tax_id_collection: {
        enabled: true
      },
      automatic_tax: {
        enabled: true
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { planId }
    })

    return { url: session.url, sessionId: session.id }
  }

  return session
}
