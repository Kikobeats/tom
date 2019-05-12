'use strict'

const beautyError = require('beauty-error')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = ({ log, err }) => log.error(beautyError(err))
