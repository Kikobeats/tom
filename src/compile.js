'use strict'

const mapValuesDeep = require('map-values-deep')
const { isNil } = require('lodash')
const pupa = require('pupa')

const compile = (template, opts) => mapValuesDeep(template, str => pupa(str, opts))

module.exports = (template, { config, opts }) => {
  const tpl = isNil(template)
    ? opts
    : compile(template, { ...config, props: opts })

  // assign props in order to replace props over config
  return { ...tpl, ...opts }
}
