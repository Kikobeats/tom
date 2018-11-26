'use strict'

const { beautyError, cleanError, getError } = require('beauty-error')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = ({ log, err }) => {
  const error = cleanError(getError(err))
  log.error(isProduction ? error : `\n${beautyError(error)}`)
}
