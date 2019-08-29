'use strict'

const { isFunction, get, set } = require('lodash')
const Emittery = require('emittery')

const setEnv = (config, configKey, globalEnvKey) => {
  const globalEnvValue = get(process.env, globalEnvKey)
  const configValue = get(config, configKey, globalEnvValue)
  set(config, configKey, configValue)
}

module.exports = fn => {
  let config
  const emitter = new Emittery()
  const on = (eventName, listener) => emitter.on(eventName, listener)
  const emit = (eventName, data) => emitter.emit(eventName, data)
  const setConfig = obj => (config = obj)

  if (isFunction(fn)) fn({ setConfig, on })
  else config = fn

  setEnv(config, 'payment.stripe_key', 'TOM_STRIPE_KEY')
  setEnv(config, 'payment.stripe_webhook_secret', 'TOM_STRIPE_WEBHOOK_SECRET')
  setEnv(config, 'email.transporter.auth.user', 'TOM_EMAIL_USER')
  setEnv(config, 'email.transporter.auth.pass', 'TOM_EMAIL_PASSWORD')
  setEnv(config, 'telegram.token', 'TOM_TELEGRAM_KEY')

  setEnv(config, 'twitter.consumer_key', 'TOM_TWITTER_CONSUMER_KEY')
  setEnv(config, 'twitter.consumer_secret', 'TOM_TWITTER_CONSUMER_SECRET')
  setEnv(config, 'twitter.access_token', 'TOM_TWITTER_ACCESS_TOKEN')
  setEnv(
    config,
    'twitter.access_token_secret',
    'TOM_TWITTER_ACCESS_TOKEN_SECRET'
  )

  return { ...config, on, emit }
}
