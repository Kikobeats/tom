'use strict'

const { get, noop } = require('lodash')
const pMemoize = require('p-memoize')
const got = require('got')

const MAX_TAX_RATES_LIMIT = 100

const getCountryTaxRate = pMemoize(async countryCode =>
  got(`https://api.ipgeolocationapi.com/countries/${countryCode}`, {
    responseType: 'json',
    resolveBodyOnly: true
  })
)

const vatmoss = ({ config, stripe, getCountryTaxRate }) => {
  const createTaxRate = countryTaxRate =>
    stripe.taxRates.create({
      display_name: 'VAT',
      description: `VAT ${countryTaxRate.name}`,
      jurisdiction: countryTaxRate.alpha2,
      percentage: get(countryTaxRate, 'vat_rates.standard'),
      inclusive: true
    })

  const { company } = config

  return async (customerMeta = {}) => {
    if (!customerMeta.eeaMember) return

    const companyTaxRate = await getCountryTaxRate(company.country)

    const { data: taxRates } = await stripe.taxRates.list({
      limit: MAX_TAX_RATES_LIMIT
    })

    const taxRate = taxRates.find(
      taxRate =>
        taxRate.inclusive &&
        taxRate.display_name === 'VAT' &&
        taxRate.jurisdiction === companyTaxRate.alpha2
    )

    return taxRate || createTaxRate(companyTaxRate)
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
