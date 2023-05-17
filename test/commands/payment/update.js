'use strict'

const { faker } = require('@faker-js/faker')
const createStripe = require('stripe')
const test = require('ava')

const { createConfig } = require('../../helpers')
const createTom = require('../../../')

const { TOM_STRIPE_KEY } = process.env

test('payment:create', async t => {
  t.plan(5)

  const config = createConfig(({ tom }) => {
    tom.on('payment:update', async data => {
      const [customer, { data: cards }] = await Promise.all([
        stripe.customers.retrieve(data.customerId),
        stripe.paymentMethods.list({ customer: customerId, type: 'card' })
      ])

      await stripe.customers.del(data.customerId)

      const defaultPaymentMethod = cards.find(
        card => card.id === customer.invoice_settings.default_payment_method
      )

      t.is(defaultPaymentMethod.card.exp_year, 2048)

      t.is(customer.metadata.country, 'US')
      t.is(customer.metadata.ipAddress, '8.8.8.8')

      t.is(data.email, email)
      t.is(data.customerId, customerId)
    })
  })

  const tom = createTom(config)
  const stripe = createStripe(TOM_STRIPE_KEY)
  const email = `test_${faker.internet.exampleEmail()}`
  const { id: customerId } = await stripe.customers.create({ email })

  const tokens = await Promise.all([
    stripe.tokens.create({
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2048,
        cvc: '123'
      }
    }),
    stripe.tokens.create({
      card: {
        number: '5555555555554444',
        exp_month: 12,
        exp_year: 2049,
        cvc: '123'
      }
    })
  ])

  const card = await stripe.customers.createSource(customerId, {
    source: tokens[0].id
  })

  const setupIntent = await stripe.setupIntents.create({
    payment_method: card.id,
    customer: customerId,
    confirm: true
  })

  await tom.payment.update({
    setupIntentId: setupIntent.id,
    customerId,
    ipAddress: '8.8.8.8'
  })
})
