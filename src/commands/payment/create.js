'use strict'

const createStripe = require('stripe')
const { pickBy, get } = require('lodash')
const got = require('got')

const { wardCredential, ward, is } = require('../../ward')

module.exports = ({ config, commands }) => {
  const errFn = wardCredential(config, {
    key: 'payment.stripe_key',
    env: 'TOM_STRIPE_KEY'
  })

  if (errFn) return errFn

  const stripe = createStripe(get(config, 'payment.stripe_key'))

  const getMetadata = async ipAddress => {
    try {
      const { body } = await got(
        `https://api.ipgeolocationapi.com/geolocate/${ipAddress}`,
        { json: true }
      )

      return pickBy({
        ipAddress,
        continent: body.continent,
        region: body.region,
        subregion: body.subregion,
        worldRegion: body.world_region,
        unLocode: body.un_locode,
        alpha2: body.alpha2,
        alpha3: body.alpha3,
        countryCode: body.country_code,
        internationalPrefix: body.international_prefix,
        ioc: body.ioc,
        gec: body.gec,
        country: body.name,
        vatRate: body.vat_rates.standard,
        currencyCode: body.currency_code,
        geo: body.geo,
        euMember: body.eu_member,
        eeaMember: body.eea_member
      })
    } catch (err) {
      return {}
    }
  }

  const payment = async ({ token, planId, templateId }) => {
    ward(token, { label: 'token', test: is.object })
    ward(token.id, { label: 'token.id', test: is.string.nonEmpty })
    ward(token.email, {
      label: 'token.email',
      test: is.string.nonEmpty,
      message: `Need to specify an 'email' to be associated with the customer.`
    })
    ward(planId, {
      label: 'planId',
      test: is.string.nonEmpty,
      message: `Need to specify a 'planId' to use`
    })

    const { email, id: source, client_ip: clientIp } = token
    const metadata = clientIp ? await getMetadata(clientIp) : undefined
    const { id: customerId } = await stripe.customers.create({
      email,
      source,
      metadata
    })

    const data = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ plan: planId }],
      metadata
    })

    return { customerId, email, planId: data.plan.id }
  }

  return payment
}
