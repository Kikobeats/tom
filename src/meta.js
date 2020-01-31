const { get, pickBy } = require('lodash')
const got = require('got')

module.exports = async ipAddress => {
  if (!ipAddress) return

  try {
    const { body } = await got(`https://api.ipgeolocationapi.com/geolocate/${ipAddress}`, {
      responseType: 'json'
    })

    return pickBy({
      ipAddress,
      continent: get(body, 'continent'),
      region: get(body, 'region'),
      subregion: get(body, 'subregion'),
      worldRegion: get(body, 'world_region'),
      unLocode: get(body, 'un_locode'),
      alpha2: get(body, 'alpha2'),
      alpha3: get(body, 'alpha3'),
      countryCode: get(body, 'country_code'),
      internationalPrefix: get(body, 'international_prefix'),
      ioc: get(body, 'ioc'),
      gec: get(body, 'gec'),
      country: get(body, 'name'),
      vatRate: get(body, 'vat_rates.standard'),
      currencyCode: get(body, 'currency_code'),
      latitude: get(body, 'geo.latitude'),
      longitude: get(body, 'geo.longitude'),
      euMember: get(body, 'eu_member'),
      eeaMember: get(body, 'eea_member')
    })
  } catch (err) {
    return {
      ipAddress
    }
  }
}
