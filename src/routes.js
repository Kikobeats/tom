'use strict'

const { get, eq, forEach } = require('lodash')
const { buffer, text } = require('http-body')
const requestIp = require('request-ip')
const toQuery = require('to-query')()
const Router = require('router-http')
const send = require('./send')

const withRoute = require('./interface/route')
const createTom = require('.')

const { TOM_API_KEY, TOM_ALLOWED_ORIGIN, NODE_ENV } = process.env

const UNAUTHENTICATED_PATHS = [
  '/',
  '/robots.txt',
  '/favicon.ico',
  '/ping',
  '/payment/webhook'
]

const getBody = async req => {
  if (req.path === '/payment/webhook') return buffer(req)
  const body = await text(req)
  if (body === '') return body
  try {
    return JSON.parse(body)
  } catch (_) {
    return body
  }
}

const isTest = NODE_ENV === 'test'

const finalhandler = (error, req, res) => {
  const hasError = error !== undefined
  return hasError
    ? send.error(
      res,
      { message: error.mesage || 'Internal Server Error' },
      error.statusCode
    )
    : send.fail(res, { message: 'HTTP Method Not Allowed' }, 405)
}

const createRouter = () => {
  const router = Router(finalhandler)

  router
    .use(require('helmet')())
    .use(require('http-compression')())
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
    .use(async (req, res, next) => {
      req.query = toQuery(req.url)
      req.ipAddress = requestIp.getClientIp(req)
      req.body = await getBody(req)
      next()
    })

  if (!isTest) router.use(require('morgan')('tiny'))

  if (TOM_API_KEY) {
    router.use((req, res, next) => {
      if (UNAUTHENTICATED_PATHS.includes(req.path)) return next()
      const apiKey = get(req, 'headers.x-api-key')
      return eq(apiKey, TOM_API_KEY)
        ? next()
        : send.fail(
          res,
          {
            message: 'Invalid API token in x-api-key header.'
          },
          401
        )
    })
  }

  router
    .get('/', (req, res) => send(res, 204))
    .get('/robots.txt', (req, res) => send(res, 204))
    .get('/favicon.ico', (req, res) => send(res, 204))
    .get('/ping', (req, res) => send(res, 200, 'pong'))

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
