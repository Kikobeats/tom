'use strict'

const createStripe = require('stripe')
const pReflect = require('p-reflect')
const { get } = require('lodash')

const { wardCredential } = require('../../ward')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, [
    { key: 'payment.stripe_key', env: 'TOM_STRIPE_KEY' },
    { key: 'payment.stripe_webhook_secret', env: 'TOM_STRIPE_WEBHOOK_SECRET' }
  ])

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))
  const webhookEndpoint = get(config, 'payment.stripe_webhook_secret')

  const webhook = async ({ headers, body }) => {
    const signature = headers['stripe-signature']

    const { value: event, isRejected, reason } = await pReflect(
      stripe.webhooks.constructEvent(body, signature, webhookEndpoint)
    )

    if (isRejected) throw new Error(reason.message)

    const { object: session } = event.data
    const { customer: customerId = null } = session

    const customer = customerId
      ? await stripe.customers.retrieve(customerId)
      : { email: null }

    const planId = get(session, 'display_items[0].plan.id', null)

    return {
      event,
      customerId,
      email: customer.email,
      planId: planId
    }
  }

  return webhook
}
