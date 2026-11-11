'use strict'

const reqCountry = require('req-country')

module.exports = async ({ ipAddress, headers }) => ({
  country: await reqCountry({ ipAddress, headers })
})
