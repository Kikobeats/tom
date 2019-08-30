const got = require('got')
const { pickBy } = require('lodash')

module.exports = async ipAddress => {
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
      latitude: body.geo.latitude,
      longitude: body.geo.longitude,
      euMember: body.eu_member,
      eeaMember: body.eea_member
    })
  } catch (err) {
    return {
      ipAddress
    }
  }
}
