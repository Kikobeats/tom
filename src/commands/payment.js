'use strict'

const createStripe = require('stripe')

module.exports = config => {
  const stripe = createStripe(config.payment.stripe_key)

  const payment = async ({token, plan}) => {
    if (!token) throw TypeError('Need to provide a valid `token`.')
    if (!plan) throw TypeError('Need to specify a `plan` to use.')

    const {email, id: source} = token
    const customer = await stripe.customers.create({email, source})
    const data = await stripe.subscriptions.create({customer: customer.id, plan})

    const log = {email, planId: data.plan.id}
    return log
  }

  return payment
}
