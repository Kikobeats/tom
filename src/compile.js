'use strict'

const { template: compileTemplate, isNil, get } = require('lodash')
const mapValuesDeep = require('map-values-deep')

const REGEX_HANDLEBARS_INTERPOLATE = /{([\s\S]+?)}/g

const compile = (template, opts) =>
  mapValuesDeep(template, value => {
    const simplePropertyMatch = value.match(/^{([^}]+)}$/)

    if (simplePropertyMatch) {
      const propertyPath = simplePropertyMatch[1].trim()
      return get(opts, propertyPath)
    }

    return compileTemplate(value, {
      interpolate: REGEX_HANDLEBARS_INTERPOLATE
    })(opts)
  })

module.exports = (template, { config, opts }) => {
  const tpl = isNil(template)
    ? opts
    : compile(template, { ...config, props: opts })

  // assign props in order to replace props over config
  return { ...tpl, ...opts }
}
