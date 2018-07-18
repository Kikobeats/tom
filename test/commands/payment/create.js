'use strict'

const createStripe = require('stripe')
const faker = require('faker')
const test = require('ava')

const createConfig = require('../../helpers/create-config')
const createTom = require('../../../')

const { STRIPE_API_KEY } = process.env

test('payment:create', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('payment:create', async data => {
      await stripe.customers.del(data.customerId)
      t.is(data.email, email)
      t.is(data.to, email)
      t.is(data.planId, planId)
      t.deepEqual(data.bcc, config.company.email)
      t.deepEqual(data.from, config.company.email)
      t.is(data.subject, `Welcome to ${config.company.site}`)
      return { foo: 'bar' }
    })
  })

  const tom = createTom(config)

  const stripe = createStripe(STRIPE_API_KEY)
  const email = `test_${faker.internet.exampleEmail()}`
  const templateId = 'payment_success'

  const stripeToken = await stripe.tokens.create({
    card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2019,
      cvc: '123'
    }
  })

  const token = { ...stripeToken, email }
  const planId = 'pro-1k'

  await tom.payment.create({ planId, token, email, templateId })
})
