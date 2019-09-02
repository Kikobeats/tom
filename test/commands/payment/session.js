'use strict'

const createStripe = require('stripe')
const faker = require('faker')
const test = require('ava')

const { createConfig } = require('../../helpers')
const createTom = require('../../../')

const { TOM_STRIPE_KEY } = process.env

test('payment:create', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('payment:session', async data => {
      await stripe.customers.del(data.customerId)
      t.is(data.customerId, customerId)
      t.is(data.email, email)
      t.is(data.planId, planId)
    })
  })

  const tom = createTom(config)
  const stripe = createStripe(TOM_STRIPE_KEY)
  const email = `test_${faker.internet.exampleEmail()}`
  const planId = 'pro-1k-v2'
  const { id: customerId } = await stripe.customers.create({ email })
  const { id: sessionId } = await stripe.checkout.sessions.create({
    customer: customerId,
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    payment_method_types: ['card'],
    subscription_data: {
      items: [
        {
          plan: planId,
          quantity: 1
        }
      ]
    }
  })

  await tom.payment.session({ sessionId })
})
