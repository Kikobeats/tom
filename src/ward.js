'use strict'

const ow = require('ow')

const ward = (input, { test, label, message }) => {
  if (!ow.isValid(input, test)) {
    const explanation = message || `Expected a valid '${label || 'input'}'`
    throw TypeError(`${explanation}, got '${input}'`)
  }
}

module.exports = { ward, is: ow }
