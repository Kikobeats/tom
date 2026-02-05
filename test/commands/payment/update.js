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

      t.is(defaultPaymentMethod.card.brand, 'mastercard')

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

  // Attach first payment method to customer
  const paymentMethod1 = await stripe.paymentMethods.attach('pm_card_visa', {
    customer: customerId
  })

  await stripe.setupIntents.create({
    payment_method: paymentMethod1.id,
    customer: customerId,
    confirm: true,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never'
    }
  })

  // Attach second payment method to customer
  const paymentMethod2 = await stripe.paymentMethods.attach(
    'pm_card_mastercard',
    {
      customer: customerId
    }
  )

  const setupIntent = await stripe.setupIntents.create({
    payment_method: paymentMethod2.id,
    customer: customerId,
    confirm: true,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never'
    }
  })

  await tom.payment.update({
    setupIntentId: setupIntent.id,
    customerId,
    ipAddress: '8.8.8.8'
  })
})
