'use strict'

const test = require('ava')

const createTom = require('..')

test.before(t => {
  delete process.env.TOM_STRIPE_KEY
  delete process.env.TOM_EMAIL_USER
  delete process.env.TOM_EMAIL_PASSWORD
})

test('config.payment.stripe_key is required', async t => {
  t.throws(
    () => createTom({}),
    "Need to specify a valid 'config.payment.stripe_key' or environment variable 'TOM_STRIPE_KEY', got 'undefined'"
  )
})

test('config.email.transporter.auth.user is required', async t => {
  t.throws(
    () =>
      createTom({
        payment: { stripe_key: 'test' }
      }),
    "Need to specify a valid 'config.email.transporter.auth.user' or environment variable 'TOM_EMAIL_USER', got 'undefined'"
  )
})

test('config.email.transporter.auth.pass is required', async t => {
  t.throws(
    () =>
      createTom({
        payment: {
          stripe_key: 'test',
          config: { email: { transporter: { auth: { user: 'test' } } } }
        }
      }),
    "Need to specify a valid 'config.email.transporter.auth.user' or environment variable 'TOM_EMAIL_USER', got 'undefined'"
  )
})
