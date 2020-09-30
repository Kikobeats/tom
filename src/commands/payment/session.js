'use strict'

const createStripe = require('stripe')
const { get } = require('lodash')

const { wardCredential, ward, is } = require('../../ward')
const meta = require('../../meta')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, [
    { key: 'payment.stripe_key', env: 'TOM_STRIPE_KEY' }
  ])

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))

  const session = async ({ ipAddress, sessionId }) => {
    ward(sessionId, {
      label: 'sessionId',
      test: is.string.nonEmpty
    })

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] })
    const { customer: customerId } = session
    const { email } = await stripe.customers.retrieve(customerId)
    const planId = get(session, 'line_items.data[0].price.id', null)

    if (ipAddress) {
      await stripe.customers.update(customerId, {
        metadata: await meta(ipAddress)
      })
    }

    return { customerId, email, planId }
  }

  return session
}
