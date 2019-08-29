'use strict'

const createStripe = require('stripe')
const { get } = require('lodash')

const { wardCredential } = require('../../ward')

module.exports = ({ config, commands }) => {
  const errFn = wardCredential(config, [
    { key: 'payment.stripe_key', env: 'TOM_STRIPE_KEY' },
    { key: 'payment.stripe_webhook_secret', env: 'TOM_STRIPE_WEBHOOK_SECRET' }
  ])

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))
  const webhookEndpoint = get(config, 'payment.stripe_webhook_secret')

  const webhook = async ({ headers, body }) => {
    const signature = headers['stripe-signature']

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookEndpoint)
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
      // https://stripe.com/docs/api/checkout/sessions/object
      const { object: session } = event.data
      const { customer: customerId = null } = session

      const customer = customerId
        ? await stripe.customers.retrieve(customerId)
        : { email: null }

      const planId = get(session, 'display_items[0].plan', null)

      return {
        customerId,
        email: customer.email,
        planId: planId
      }
    }
  }

  return webhook
}
