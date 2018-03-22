'use strict'

const cosmiconfig = require('cosmiconfig')('tom')
const cleanStack = require('clean-stack')
const acho = require('acho')

const createLog = opts => acho(Object.assign({}, opts))

const printError = ({ log, err }) => {
  const { message, stack } = err
  if (stack) log.error(cleanStack(stack))
  else log.error(message)
}

const wrapAction = async ({ fn, log, opts, onSuccess, onFail }) => {
  if (!fn) throw Error('Need to provide a function to be wrapper.')

  try {
    const info = await fn(opts)
    log.debug(info)
    onSuccess()
  } catch (err) {
    printError({ log, err })
    onFail(err)
  }
}

const wrapRoute = ({ fn, keyword }) => {
  const log = createLog({ keyword })
  return async (req, res) =>
    wrapAction({
      fn,
      log,
      opts: req.body,
      onSuccess: () => res.success(200),
      onFail: err => res.fail({ message: err.message || err })
    })
}

const loadConfig = async (cwd = process.cwd()) => {
  const { config } = (await cosmiconfig.load(cwd)) || {}
  return config
}

module.exports = {
  wrapRoute,
  wrapAction,
  createLog,
  loadConfig
}
