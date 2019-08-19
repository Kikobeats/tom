'use strict'

const createStripe = require('stripe')
const faker = require('faker')
const test = require('ava')

const createConfig = require('../../helpers/create-config')
const createTom = require('../../../')

const { TOM_STRIPE_KEY } = process.env

test('payment:create', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('payment:create', async data => {
      await stripe.customers.del(data.customerId)
      t.is(data.email, email)
      t.is(data.planId, planId)
      return { foo: 'bar' }
    })
  })

  const tom = createTom(config)

  const stripe = createStripe(TOM_STRIPE_KEY)
  const email = `test_${faker.internet.exampleEmail()}`
  const stripeToken = await stripe.tokens.create({
    card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2019,
      cvc: '123'
    }
  })

  const token = { ...stripeToken, email }
  const planId = 'pro-1k-v2'

  await tom.payment.create({ planId, token, email })
})
