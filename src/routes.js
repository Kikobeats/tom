'use strict'

const bodyParser = require('body-parser')
const commands = require('../src')

const {loadConfig, wrapRoute} = require('../src/helpers')

const {API_KEY} = process.env

module.exports = async (app, express) => {
  const config = await loadConfig()
  const {payment, email} = commands(config)

  app
    .use(require('helmet')())
    .use(require('jsendp')())
    .use(require('compression')())
    .use(require('cors')())
    .use(require('query-types').middleware())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(require('morgan')('short'))
    .disable('x-powered-by')

  if (API_KEY) {
    app.use('*', (req, res, next) => {
      const apiKey = req.headers['x-api-key']
      return apiKey === API_KEY
        ? next()
        : res.fail({
          statusCode: 401,
          message: 'Invalid API token in x-api-key header.'
        })
    })
  }

  app.get('/', (req, res) => res.send(''))
  app.get('/ping', (req, res) => res.send('pong'))
  app.post('/payment', wrapRoute(payment))
  app.post('/email', wrapRoute(email))

  app.use((req, res) => res.fail({
    statusCode: 405,
    message: 'HTTP Method Not Allowed'
  }))

  return app
}
