'use strict'

const createStripe = require('stripe')
const test = require('ava')

const { TOM_STRIPE_KEY } = process.env

const stripe = createStripe(TOM_STRIPE_KEY)

const createGetTaxRate = require('../../src/get-tax-rate')

test("don't apply taxes if strategy is not defined", async t => {
  const config = { company: {} }
  const getTaxRate = createGetTaxRate({ config, stripe })

  t.is(await getTaxRate({}), undefined)
  t.is(
    await getTaxRate({
      eeaMember: true,
      country: 'Germany',
      vatRate: 19,
      alpha2: 'DE'
    }),
    undefined
  )
})

test('throw an error if tax rate strategy not found', async t => {
  const config = { company: { tax_type: 'generic' } }

  t.throws(() => createGetTaxRate({ config, stripe }), {
    instanceOf: TypeError,
    message: 'Tax rate strategy not found.'
  })
})
