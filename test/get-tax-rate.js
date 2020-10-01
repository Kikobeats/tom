'use strict'

const createStripe = require('stripe')
const test = require('ava')

const { TOM_STRIPE_KEY } = process.env

const stripe = createStripe(TOM_STRIPE_KEY)

const getTaxRate = require('../src/get-tax-rate')(stripe)

test('exclude countries out of the European Economic Area (EEA)', async t => {
  const taxRate = await getTaxRate({})
  t.is(taxRate, undefined)
})

test('get a tax rate based on country', async t => {
  t.true(
    typeof (await getTaxRate({
      eeaMember: true,
      country: 'Germany',
      vatRate: 19,
      alpha2: 'DE'
    })) === 'object'
  )

  t.true(
    typeof (await getTaxRate({
      eeaMember: true,
      country: 'Denmark',
      vatRate: 25,
      alpha2: 'DA'
    })) === 'object'
  )

  t.true(
    typeof (await getTaxRate({
      eeaMember: true,
      country: 'France',
      vatRate: 20,
      alpha2: 'FR'
    })) === 'object'
  )
})
