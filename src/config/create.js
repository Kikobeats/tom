'use strict'

const { isFunction, get, set } = require('lodash')
const mitt = require('mitt')

const createEmitter = () => {
  const emitter = mitt()
  emitter.emitAsync = (type, data) =>
    Promise.all(
      []
        .concat(emitter.all.get('*'))
        .concat(emitter.all.get(type))
        .filter(Boolean)
        .map(fn => fn(data))
    )
  return emitter
}

const setEnv = (config, configKey, globalEnvKey) => {
  const globalEnvValue = get(process.env, globalEnvKey)
  const configValue = get(config, configKey, globalEnvValue)
  set(config, configKey, configValue)
}

module.exports = fn => {
  let config
  const emitter = createEmitter()
  const on = (eventName, listener) => emitter.on(eventName, listener)
  const emit = (eventName, data) => emitter.emitAsync(eventName, data)
  const setConfig = obj => (config = obj)

  if (isFunction(fn)) fn({ setConfig, on })
  else config = fn

  setEnv(config, 'payment.stripe_key', 'TOM_STRIPE_KEY')
  setEnv(config, 'payment.stripe_webhook_secret', 'TOM_STRIPE_WEBHOOK_SECRET')
  setEnv(config, 'email.transporter.auth.user', 'TOM_EMAIL_USER')
  setEnv(config, 'email.transporter.auth.pass', 'TOM_EMAIL_PASSWORD')
  setEnv(config, 'telegram.token', 'TOM_TELEGRAM_KEY')

  return { ...config, on, emit }
}
