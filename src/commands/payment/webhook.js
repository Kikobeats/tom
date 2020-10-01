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

  const getCustomer = async customerId => {
    if (!customerId) return {}
    const { isRejected, value } = await pReflect(stripe.customers.retrieve(customerId))
    if (isRejected) return {}
    return value
  }

  const webhook = async ({ headers, body }) => {
    const signature = headers['stripe-signature']
    const { value: event, isRejected, reason } = await pReflect(stripe.webhooks.constructEvent(body, signature, webhookEndpoint))
    if (isRejected) throw new Error(reason.message)

    const { object: session } = event.data
    const { customer: customerId = null } = session
    const { email } = await getCustomer(customerId)
    const planId = get(session, 'display_items[0].plan.id')

    return { event, customerId, email, planId }
  }

  return webhook
}
