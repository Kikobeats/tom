'use strict'

const { get, eq, forEach } = require('lodash')
const bodyParser = require('body-parser')
const toQuery = require('to-query')()
const express = require('express')

const withRoute = require('./interface/route')
const createTom = require('.')

const { TOM_API_KEY, TOM_ALLOWED_ORIGIN, NODE_ENV } = process.env

const isTest = NODE_ENV === 'test'

const { Router } = express

const jsonBodyParser = bodyParser.json()
const urlEncodedBodyParser = bodyParser.urlencoded({ extended: true })
const rawBodyParser = bodyParser.raw({ type: 'application/json' })

const createRouter = () => {
  const router = Router()

  router.use(require('helmet')())
  router.use(require('jsendp')())
  router.use(require('compression')())
  router.use(
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

  router.use((req, res, next) => {
    if (req.path.endsWith('webhook')) return rawBodyParser(req, res, next)
    return jsonBodyParser(urlEncodedBodyParser(req, res, next))
  })

  router.use((req, res, next) => {
    req.query = toQuery(req.url)
    next()
  })

  if (!isTest) router.use(require('morgan')('tiny'))

  router.get('/', (req, res) => res.status(204).send())
  router.get('/robots.txt', (req, res) => res.status(204).send())
  router.get('/favicon.ico', (req, res) => res.status(204).send())
  router.get('/ping', (req, res) => res.send('pong'))

  if (TOM_API_KEY) {
    router.use((req, res, next) => {
      if (req.path.endsWith('webhook')) return next()
      const apiKey = get(req, 'headers.x-api-key')
      return eq(apiKey, TOM_API_KEY)
        ? next()
        : res.fail({
          statusCode: 401,
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

  router.use((req, res) =>
    res.fail({
      statusCode: 405,
      message: 'HTTP Method Not Allowed'
    })
  )

  return router
}
