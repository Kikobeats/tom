'use strict'

const { concat, get, isNil, find } = require('lodash')
const { default: ow } = require('ow')

const ward = (input, { test, label, message }) => {
  if (!ow.isValid(input, test)) {
    const explanation = message || `Expected a valid '${label || 'input'}'`
    throw TypeError(`${explanation}, got '${input}'`)
  }
}

const wardCredential = (config, collection) => {
  const cond = find(concat(collection), ({ key, env }) => {
    const value = get(config, key)
    return isNil(value)
  })

  if (!isNil(cond)) {
    return () => {
      throw new TypeError(
        `Need to specify a valid 'config.${
          cond.key
        }' or environment variable '${cond.env}'`
      )
    }
  }
}

module.exports = { wardCredential, ward, is: ow }
