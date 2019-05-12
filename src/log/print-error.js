'use strict'

const beautyError = require('beauty-error')

module.exports = ({ log, err }) => log.error(beautyError(err))
