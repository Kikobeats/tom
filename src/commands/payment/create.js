'use strict'

const createStripe = require('stripe')

const { ward, is } = require('../../ward')

module.exports = ({ config, commands }) => {
  const stripe = createStripe(config.payment.stripe_key)
  const { email: sendEmail } = commands.notification

  const payment = async ({ token, plan, emailTemplate: template }) => {
    ward(token, { label: 'token', test: is.object })
    ward(token.id, { label: 'token.id', test: is.string.nonEmpty })
    ward(token.email, {
      label: 'token.email',
      test: is.string.nonEmpty,
      message: `Need to specify an 'email' to be associated with the customer.`
    })
    ward(plan, {
      label: 'plan',
      test: is.string.nonEmpty,
      message: `Need to specify a 'plan' to use`
    })

    const { email, id: source } = token
    const customer = await stripe.customers.create({ email, source })
    const data = await stripe.subscriptions.create({
      customer: customer.id,
      plan
    })

    const logEmail = template
      ? await sendEmail({ template, to: email }, { printLog: false })
      : {}
    const log = { email, planId: data.plan.id, ...logEmail }

    return { log }
  }

  return payment
}
