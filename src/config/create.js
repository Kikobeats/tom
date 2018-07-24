'use strict'

const { isFunction, get, set } = require('lodash')
const Emittery = require('emittery')

const { ward, is } = require('../ward')

const requiredValue = (config, configKey, globalEnvKey) => {
  const globalEnvValue = get(process.env, globalEnvKey)
  const configValue = get(config, configKey, globalEnvValue)
  set(config, configKey, configValue)
  ward(get(config, configKey), {
    label: `config.${configKey}`,
    test: is.string.nonEmpty,
    message: `Need to specify a valid 'config.${configKey}' or environment variable '${globalEnvKey}'`
  })
}

module.exports = fn => {
  let config
  const emitter = new Emittery()
  const on = (eventName, listener) => emitter.on(eventName, listener)
  const emit = (eventName, data) => emitter.emit(eventName, data)
  const setConfig = obj => (config = obj)

  if (isFunction(fn)) fn({ setConfig, on })
  else config = fn

  requiredValue(config, 'payment.stripe_key', 'TOM_STRIPE_KEY')
  requiredValue(config, 'email.transporter.auth.user', 'TOM_EMAIL_USER')
  requiredValue(config, 'email.transporter.auth.pass', 'TOM_EMAIL_PASSWORD')

  return { ...config, on, emit }
}
