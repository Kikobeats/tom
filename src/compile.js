'use strict'

const { pick, isNil } = require('lodash')
const deepMap = require('deep-map')

const pupa = require('pupa')

const compile = (template, opts) => deepMap(template, str => pupa(str, opts))

module.exports = ({ template, config, opts, pickProps }) => {
  const tpl = isNil(template)
    ? opts
    : compile(template, { ...config, props: opts })

  // assign props in order to replace props over config
  return { ...pick(tpl, pickProps), ...pick(opts, pickProps) }
}
