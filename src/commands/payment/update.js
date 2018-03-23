'use strict'

const createStripe = require('stripe')

module.exports = ({ config, commands }) => {
  const stripe = createStripe(config.payment.stripe_key)
  const { email: sendEmail } = commands.notification

  const payment = async ({ token, userId: id, emailTemplate: template }) => {
    if (!token) throw TypeError('Need to provide a valid `token`.')
    if (!id) throw TypeError('Need to specify an user `id`.')

    const { id: source } = token
    await stripe.customers.update(id, { source })

    const { email } = await stripe.customers.retrieve(id)
    if (!email) { throw TypeError('Not found the `email` associated with the customer.') }

    const logEmail = template ? await sendEmail({ template, to: email }) : {}
    const log = Object.assign({}, { email }, logEmail)

    return log
  }

  return payment
}
