'use strict'

const { pick } = require('lodash')
const deepMap = require('deep-map')

const pupa = require('pupa')

const compile = (template, opts) => deepMap(template, str => pupa(str, opts))

module.exports = ({ template, config, opts, pickProps }) => {
  const tpl = compile(template, { ...config, props: opts })
  // assign props in order to replace props over config
  return { ...pick(tpl, pickProps), ...pick(opts, pickProps) }
}
