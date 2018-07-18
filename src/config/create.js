'use strict'

const { isFunction } = require('lodash')
const Emittery = require('emittery')

module.exports = fn => {
  let config
  const emitter = new Emittery()
  const on = (eventName, listener) => emitter.on(eventName, listener)
  const emit = (eventName, data) => emitter.emit(eventName, data)
  const setConfig = obj => (config = obj)

  if (isFunction(fn)) fn({ setConfig, on })
  else config = fn

  return { ...config, on, emit }
}
