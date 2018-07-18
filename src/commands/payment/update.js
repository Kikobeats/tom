'use strict'

const createStripe = require('stripe')

const { ward, is } = require('../../ward')

module.exports = ({ config, commands }) => {
  const stripe = createStripe(config.payment.stripe_key)
  const { email: sendEmail } = commands.notification

  const payment = async ({ token, userId: id, emailTemplate: template }) => {
    ward(token, { label: 'token', test: is.object })
    ward(token.source, { label: 'token.source', test: is.object })
    ward(id, { label: 'userId', test: is.string.nonEmpty })

    const { id: source } = token
    await stripe.customers.update(id, { source })

    const { email } = await stripe.customers.retrieve(id)
    ward(email, {
      label: 'email',
      test: is.string.nonEmpty,
      message: `Not found the 'email' associated with the customer.`
    })

    const logEmail = template
      ? await sendEmail({ template, to: email }, { printLog: false })
      : {}
    const log = { email, ...logEmail }

    return { log }
  }

  return payment
}
