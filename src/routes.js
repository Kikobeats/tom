'use strict'

const { eq, reduce, forEach, camelCase } = require('lodash')
const bodyParser = require('body-parser')
const autoParse = require('auto-parse')

const { loadConfig, wrapRoute } = require('./helpers')
const createCommands = require('.')

const { TOM_API_KEY, TOM_ALLOWED_ORIGIN = '*' } = process.env

const normalize = query =>
  reduce(
    query,
    (acc, value, key) => ({ ...acc, [camelCase(key)]: autoParse(value) }),
    {}
  )

module.exports = async (app, express) => {
  const config = await loadConfig()

  app
    .use(require('helmet')())
    .use(require('jsendp')())
    .use(require('compression')())
    .use(
      require('cors')({
        methods: ['GET', 'OPTIONS', 'POST'],
        origin: TOM_ALLOWED_ORIGIN.replace(/\s/g, '').split(','),
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
    .use(require('morgan')('short'))
    .use((req, res, next) => {
      req.body = normalize(req.body)
      req.query = normalize(req.query)
      next()
    })
    .disable('x-powered-by')

  app.get('/', (req, res) => res.status(204).send())
  app.get('/robots.txt', (req, res) => res.status(204).send())
  app.get('/favicon.txt', (req, res) => res.status(204).send())
  app.get('/ping', (req, res) => res.send('pong'))

  if (TOM_API_KEY) {
    app.use((req, res, next) => {
      const apiKey = req.headers['x-api-key']
      return eq(apiKey, TOM_API_KEY)
        ? next()
        : res.fail({
          statusCode: 401,
          message: 'Invalid API token in x-api-key header.'
        })
    })
  }

  const commands = createCommands(config)

  forEach(commands, (subCommands, commandName) => {
    forEach(subCommands, (subCommandFn, subCommandName) => {
      const route = `/${commandName}/${subCommandName}`
      const fn = wrapRoute({
        fn: subCommandFn,
        keyword: `${commandName}.${subCommandName}`
      })
      app.post(route, fn)
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
