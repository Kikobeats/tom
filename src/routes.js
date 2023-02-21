'use strict'

const { get, eq, forEach } = require('lodash')
const bodyParser = require('body-parser')
const requestIp = require('request-ip')
const toQuery = require('to-query')()
const Router = require('router-http')
const send = require('send-http')

send.fail = (res, code = 400, data) => {
  send(res, code, {
    status: 'fail',
    ...data
  })
}

send.error = (res, code = 500, data) => {
  send(res, code, {
    status: 'error',
    ...data
  })
}

send.success = (res, code = 200, data) => {
  send(res, code, {
    status: 'success',
    ...data
  })
}

const withRoute = require('./interface/route')
const createTom = require('.')

const { TOM_API_KEY, TOM_ALLOWED_ORIGIN, NODE_ENV } = process.env

const isTest = NODE_ENV === 'test'

const jsonBodyParser = bodyParser.json()
const urlEncodedBodyParser = bodyParser.urlencoded({ extended: true })
const rawBodyParser = bodyParser.raw({ type: 'application/json' })
const isWebhook = req => req.path.endsWith('webhook')

const finalhandler = (error, req, res) => {
  const hasError = error !== undefined
  // if (hasError) console.error(error)
  return hasError
    ? send.error(res, 500, { message: error.mesage || 'Internal Server Error' })
    : send.fail(res, 405, { message: 'HTTP Method Not Allowed' })
}

const createRouter = () => {
  const router = Router(finalhandler)

  router
    .use(require('helmet')())
    .use(require('compression')())
    .use(
      require('cors')({
        methods: ['GET', 'OPTIONS', 'POST'],
        origin: TOM_ALLOWED_ORIGIN
          ? TOM_ALLOWED_ORIGIN.replace(/\s/g, '').split(',')
          : '*',
        allowedHeaders: [
          'content-type',
          'x-amz-date',
          'authorization',
          'x-api-key',
          'x-amz-security-token',
          'x-csrf-token'
        ]
      })
    )
    .use((req, res, next) =>
      isWebhook(req) ? rawBodyParser(req, res, next) : next()
    )
    .use((req, res, next) =>
      isWebhook(req) ? next() : urlEncodedBodyParser(req, res, next)
    )
    .use((req, res, next) =>
      isWebhook(req) ? next() : jsonBodyParser(req, res, next)
    )
    .use((req, res, next) => {
      req.query = toQuery(req.url)
      req.ipAddress = requestIp.getClientIp(req)
      next()
    })

  if (!isTest) router.use(require('morgan')('tiny'))

  router
    .get('/', (req, res) => send(res, 204))
    .get('/robots.txt', (req, res) => send(res, 204))
    .get('/favicon.ico', (req, res) => send(res, 204))
    .get('/ping', (req, res) => send(res, 200, 'pong'))

  if (TOM_API_KEY) {
    router.use((req, res, next) => {
      if (req.path.endsWith('webhook')) return next()
      const apiKey = get(req, 'headers.x-api-key')
      return eq(apiKey, TOM_API_KEY)
        ? next()
        : send.fail(res, 401, {
          message: 'Invalid API token in x-api-key header.'
        })
    })
  }

  return router
}

module.exports = tomConfig => {
  if (!tomConfig) throw TypeError('You need to provide tom configuration file.')

  const router = createRouter()
  const tom = createTom(tomConfig)

  forEach(tom, (cmd, cmdName) => {
    forEach(cmd, (fn, actionName) => {
      const eventName = `${cmdName}.${actionName}`
      router.post(
        `/${cmdName}/${actionName}`,
        withRoute({ tom, fn, eventName })
      )
    })
  })

  return router
}
