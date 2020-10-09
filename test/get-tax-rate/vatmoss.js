'use strict'

const createStripe = require('stripe')
const test = require('ava')

const { TOM_STRIPE_KEY } = process.env

const stripe = createStripe(TOM_STRIPE_KEY)

const config = {
  company: {
    country: 'es',
    tax_type: 'vatmoss'
  }
}

const createGetTaxRate = require('../../src/get-tax-rate')

const getTaxRate = createGetTaxRate({ config, stripe })

test('exclude countries out of the European Economic Area (EEA)', async t => {
  const taxRate = await getTaxRate({})
  t.is(taxRate, undefined)
})

test('apply company tax rate if customer country is from EEA', async t => {
  const taxRate = await getTaxRate({
    eeaMember: true,
    country: 'Germany',
    vatRate: 19,
    alpha2: 'DE'
  })

  t.is(taxRate.description, 'VAT Spain')
  t.is(taxRate.display_name, 'VAT')
  t.is(taxRate.display_name, 'VAT')
  t.true(taxRate.inclusive)
  t.is(taxRate.jurisdiction.toUpperCase(), config.company.country.toUpperCase())
  t.is(taxRate.percentage, 21)
})
