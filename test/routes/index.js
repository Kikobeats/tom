'use strict'

const { reduce, forEach } = require('lodash')
const listen = require('test-listen')
const http = require('http')
const test = require('ava')
const got = require('got')
const url = require('url')

const createServer = require('../../bin/server')

const createTom = require('../..')

const getApiUrl = async () => {
  const app = await createServer()
  return listen(http.createServer(app))
}

const allRoutes = reduce(
  createTom(),
  (acc, cmd, cmdName) => {
    forEach(cmd, (fn, actionName) => {
      acc.push(`/${cmdName}/${actionName}`)
    })
    return acc
  },
  []
)
;['/', '/robots.txt', '/favicon.ico'].forEach(route => {
  test(route, async t => {
    const apiUrl = await getApiUrl()
    const { statusCode } = await got(url.resolve(apiUrl, route))
    t.is(statusCode, 204)
  })
})

allRoutes.forEach(route => {
  test(`OPTIONS ${route}`, async t => {
    const apiUrl = await getApiUrl()
    const { statusCode } = await got(url.resolve(apiUrl, route), {
      method: 'OPTIONS'
    })
    t.is(statusCode, 204)
  })
})
