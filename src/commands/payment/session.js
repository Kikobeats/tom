'use strict'

const createStripe = require('stripe')

const { get } = require('lodash')

const { wardCredential, ward, is } = require('../../ward')
const getMetadata = require('../../get-metadata')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, [
    { key: 'payment.stripe_key', env: 'TOM_STRIPE_KEY' }
  ])

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))

  const session = async ({
    ipAddress,
    headers,
    planId,
    successUrl,
    cancelUrl
  }) => {
    ward(planId, {
      label: 'planId',
      test: is.string.nonEmpty
    })

    const metadata = await getMetadata({ ipAddress, headers })

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'required',
      mode: 'subscription',
      line_items: [
        {
          price: planId,
          quantity: 1
        }
      ],
      tax_id_collection: {
        enabled: true
      },
      automatic_tax: {
        enabled: true
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { ...metadata, planId }
    })

    return { sessionId: session.id }
  }

  return session
}
