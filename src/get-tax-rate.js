'use strict'

const { eeaMember, getCountry } = require('is-european')
const countryVat = require('country-vat')
const { noop } = require('lodash')

const MAX_TAX_RATES_LIMIT = 100

const getCountryTaxRate = country => countryVat(country) * 100

const createTaxRateFactory = stripe => ({ name, alpha2, percentage }) =>
  stripe.taxRates.create({
    display_name: 'VAT',
    description: `VAT ${name}`,
    jurisdiction: alpha2,
    percentage,
    inclusive: true
  })

const vatmoss = ({ config, stripe, getCountryTaxRate }) => {
  const createTaxRate = createTaxRateFactory(stripe)

  return async ({ country } = {}) => {
    if (!eeaMember(country)) return

    const companyCountry = getCountry(config.company.country)

    const { data: taxRates } = await stripe.taxRates.list({
      limit: MAX_TAX_RATES_LIMIT
    })

    const taxRate = taxRates.find(
      taxRate =>
        taxRate.active &&
        taxRate.inclusive &&
        taxRate.display_name === 'VAT' &&
        taxRate.jurisdiction === companyCountry.alpha2
    )

    return (
      taxRate ||
      createTaxRate({
        ...companyCountry,
        percentage: getCountryTaxRate(config.company.country)
      })
    )
  }
}

const strategies = { vatmoss }

module.exports = ({ config, stripe }) => {
  const { tax_type: taxType } = config.company
  if (taxType === undefined) return noop

  const createStrategy = strategies[taxType]
  if (!createStrategy) throw new TypeError('Tax rate strategy not found.')

  return createStrategy({ config, stripe, getCountryTaxRate })
}
