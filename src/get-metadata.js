'use strict'

const reqCountry = require('req-country')

module.exports = async ({ ipAddress, headers }) => {
  const country = reqCountry({ ipAddress, headers })
  return { ipAddress, country }
}
