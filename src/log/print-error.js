'use strict'

const beautyError = require('beauty-error')

module.exports = ({ log, error }) => log.error(beautyError(error))
