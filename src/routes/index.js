'use strict'

const { get, eq, forEach } = require('lodash')
const bodyParser = require('body-parser')
const toQuery = require('to-query')()

const withRoute = require('../interface/route')
const loadConfig = require('../config/load')
const createTom = require('..')

const { TOM_API_KEY, TOM_ALLOWED_ORIGIN, NODE_ENV } = process.env

const isTest = NODE_ENV === 'test'

module.exports = async (app, express) => {
  const config = await loadConfig()

  app
    .use(require('helmet')())
    .use(require('jsendp')())
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
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use((req, res, next) => {
      req.query = toQuery(req.url)
      next()
    })
    .disable('x-powered-by')

  if (!isTest) app.use(require('morgan')('short'))

  app.get('/', (req, res) => res.status(204).send())
  app.get('/robots.txt', (req, res) => res.status(204).send())
  app.get('/favicon.ico', (req, res) => res.status(204).send())
  app.get('/ping', (req, res) => res.send('pong'))

  if (TOM_API_KEY) {
    app.use((req, res, next) => {
      const apiKey = get(req, 'headers.x-api-key')
      return eq(apiKey, TOM_API_KEY)
        ? next()
        : res.fail({
          statusCode: 401,
          message: 'Invalid API token in x-api-key header.'
        })
    })
  }

  const tom = createTom(config)

  forEach(tom, (cmd, cmdName) => {
    forEach(cmd, (fn, actionName) => {
      const eventName = `${cmdName}.${actionName}`
      app.post(`/${cmdName}/${actionName}`, withRoute({ tom, fn, eventName }))
    })
  })

  app.use((req, res) =>
    res.fail({
      statusCode: 405,
      message: 'HTTP Method Not Allowed'
    })
  )

  return app
}
