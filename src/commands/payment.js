'use strict'

const createStripe = require('stripe')
const createEmail = require('./email')

module.exports = config => {
  const stripe = createStripe(config.payment.stripe_key)
  const sendEmail = createEmail(config)

  const payment = async ({token, plan, emailTemplate: template}) => {
    if (!token) throw TypeError('Need to provide a valid `token`.')
    if (!plan) throw TypeError('Need to specify a `plan` to use.')

    const {email, id: source} = token
    const customer = await stripe.customers.create({email, source})
    const data = await stripe.subscriptions.create({customer: customer.id, plan})
    const logEmail = template ? await sendEmail({ template, to: email }) : {}

    const log = Object.assign({}, {email, planId: data.plan.id}, logEmail)
    return log
  }

  return payment
}
