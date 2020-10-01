'use strict'

module.exports = stripe => {
  const createTaxRate = meta =>
    stripe.taxRates.create({
      display_name: 'VAT',
      description: `VAT ${meta.country}`,
      jurisdiction: meta.alpha2,
      percentage: meta.vatRate,
      inclusive: false
    })

  return async (meta = {}) => {
    if (!meta.eeaMember) return
    const { data: taxRates } = await stripe.taxRates.list({ limit: 100 })
    const taxRate = taxRates.find(
      taxRate =>
        !taxRate.inclusive &&
        taxRate.display_name === 'VAT' &&
        taxRate.jurisdiction === meta.alpha2
    )
    return taxRate || createTaxRate(meta)
  }
}
