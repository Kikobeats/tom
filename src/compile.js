'use strict'

const { template: compileTemplate, isNil } = require('lodash')
const mapValuesDeep = require('map-values-deep')

const REGEX_HANDLEBARS_INTERPOLATE = /{([\s\S]+?)}/g

const compile = (template, opts) =>
  mapValuesDeep(template, str =>
    compileTemplate(str, { interpolate: REGEX_HANDLEBARS_INTERPOLATE })(opts)
  )

module.exports = (template, { config, opts }) => {
  const tpl = isNil(template)
    ? opts
    : compile(template, { ...config, props: opts })

  // assign props in order to replace props over config
  return { ...tpl, ...opts }
}
