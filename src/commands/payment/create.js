'use strict'

const createStripe = require('stripe')

module.exports = ({ config, commands }) => {
  const stripe = createStripe(config.payment.stripe_key)
  const { email: sendEmail } = commands.notification

  const payment = async ({ token, plan, emailTemplate: template }) => {
    if (!token) throw TypeError('Need to provide a valid `token`.')
    if (!plan) throw TypeError('Need to specify a `plan` to use.')

    const { email, id: source } = token
    if (!email) {
      throw TypeError(
        'Need to specify an `email` to be associated with the customer.'
      )
    }

    const customer = await stripe.customers.create({ email, source })
    const data = await stripe.subscriptions.create({
      customer: customer.id,
      plan
    })

    const logEmail = template ? await sendEmail({ template, to: email }) : {}
    const log = Object.assign({}, { email, planId: data.plan.id }, logEmail)
    return log
  }

  return payment
}
