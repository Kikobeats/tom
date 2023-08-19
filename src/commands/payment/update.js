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

  const update = async ({ setupIntentId, customerId, ipAddress, headers }) => {
    ward(customerId, { label: 'customerId', test: is.string.nonEmpty })
    ward(setupIntentId, { label: 'setupIntentId', test: is.string.nonEmpty })

    const [
      newMetadata,
      { metadata: oldMetadata, email },
      { payment_method: paymentMethod }
    ] = await Promise.all([
      getMetadata({ ipAddress, headers }),
      stripe.customers.retrieve(customerId),
      stripe.setupIntents.retrieve(setupIntentId)
    ])

    await Promise.all([
      stripe.customers.update(customerId, {
        metadata: { ...oldMetadata, ...newMetadata },
        invoice_settings: { default_payment_method: paymentMethod }
      }),
      Promise.all(
        (
          await stripe.paymentMethods
            .list({ customer: customerId, type: 'card' })
            .then(({ data }) => data)
        )
          .map(({ id }) => id)
          .filter(id => id !== paymentMethod)
          .map(id => stripe.paymentMethods.detach(id))
      )
    ])

    ward(email, {
      label: 'email',
      test: is.string.nonEmpty,
      message: `The customer id \`${customerId}\` doesn't have an email associated.`
    })

    return { customerId, email }
  }

  return update
}
