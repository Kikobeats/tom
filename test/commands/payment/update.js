'use strict'

const faker = require('@faker-js/faker')
const createStripe = require('stripe')
const test = require('ava')

const { createConfig } = require('../../helpers')
const createTom = require('../../../')

const { TOM_STRIPE_KEY } = process.env

test('payment:create', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('payment:update', async data => {
      await stripe.customers.del(data.customerId)
      t.is(data.email, email)
      t.is(data.customerId, customerId)
    })
  })

  const tom = createTom(config)
  const stripe = createStripe(TOM_STRIPE_KEY)
  const email = `test_${faker.internet.exampleEmail()}`
  const { id: customerId } = await stripe.customers.create({ email })

  const token = await stripe.tokens.create({
    card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2049,
      cvc: '123'
    }
  })

  await tom.payment.update({ customerId, token })
})
