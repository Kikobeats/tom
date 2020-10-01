'use strict'

const createStripe = require('stripe')
const { get } = require('lodash')

const { wardCredential, ward, is } = require('../../ward')
const createGetTaxRate = require('../../get-tax-rate')
const getMetadata = require('../../get-metadata')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, [{ key: 'payment.stripe_key', env: 'TOM_STRIPE_KEY' }])

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))
  const getTaxRate = createGetTaxRate(stripe)

  const session = async ({ ipAddress, planId, successUrl, cancelUrl }) => {
    ward(planId, {
      label: 'sessionId',
      test: is.string.nonEmpty
    })

    const metadata = await getMetadata(ipAddress)
    const taxRate = await getTaxRate(metadata)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId,
          quantity: 1,
          tax_rates: taxRate ? [taxRate.id] : undefined
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    })

    return { sessionId: session.id }
  }

  return session
}
