'use strict'

const createStripe = require('stripe')
const test = require('ava')

const { createConfig } = require('../../helpers')
const createTom = require('../../../')

const { TOM_STRIPE_KEY } = process.env

const stripe = createStripe(TOM_STRIPE_KEY)

test('payment:create', async t => {
  t.plan(4)

  const config = createConfig(({ tom }) => {
    tom.on('payment:session', async ({ sessionId }) => {
      t.is(typeof sessionId, 'string')
      t.true(!!(await stripe.checkout.sessions.retrieve(sessionId)))
    })
  })

  const tom = createTom(config)
  const planId = 'price_1SxP2pKverDflymFUxwHuGJI'

  const { url, sessionId } = await tom.payment.session({
    planId,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel'
  })

  t.is(typeof url, 'string')
  t.is(typeof sessionId, 'string')
})

test('payment:create has adaptive pricing enabled', async t => {
  const config = createConfig()
  const tom = createTom(config)
  const planId = 'price_1SxP2pKverDflymFUxwHuGJI'

  const { sessionId } = await tom.payment.session({
    planId,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel'
  })

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  t.is(session.adaptive_pricing.enabled, true)
})

test('payment:create resolves lookup key to price ID', async t => {
  const config = createConfig()
  const tom = createTom(config)

  const { url, sessionId } = await tom.payment.session({
    planId: 'tom-test-lookup-key',
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel'
  })

  t.is(typeof url, 'string')
  t.is(typeof sessionId, 'string')
})

test('payment:create throws for unknown lookup key', async t => {
  const config = createConfig()
  const tom = createTom(config)

  await t.throwsAsync(
    () =>
      tom.payment.session({
        planId: 'nonexistent-key',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel'
      }),
    { instanceOf: TypeError, message: /doesn't match any active Stripe price/ }
  )
})
