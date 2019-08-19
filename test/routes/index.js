'use strict'

const { reduce, forEach } = require('lodash')
const listen = require('test-listen')
const { URL } = require('url')
const http = require('http')
const test = require('ava')
const got = require('got')

const { createConfig: createMockConfig } = require('../helpers')
const { createServer } = require('../../bin/listen')
const createRoutes = require('../../src/routes')
const createTom = require('../..')

const { createConfig } = createTom

const config = createConfig(createMockConfig())
const routes = createRoutes(config)

const getApiUrl = async () => {
  const app = await createServer(routes)
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
;['/', '/robots.txt', '/favicon.ico'].forEach(pathname => {
  test(pathname, async t => {
    const apiUrl = await getApiUrl()
    const { statusCode } = await got(new URL(pathname, apiUrl))
    t.is(statusCode, 204)
  })
})

allRoutes.forEach(pathname => {
  test(`OPTIONS ${pathname}`, async t => {
    const apiUrl = await getApiUrl()
    const { statusCode } = await got(new URL(pathname, apiUrl), {
      method: 'OPTIONS'
    })
    t.is(statusCode, 204)
  })
})
