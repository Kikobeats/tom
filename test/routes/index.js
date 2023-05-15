'use strict'

const { reduce, forEach } = require('lodash')
const { listen } = require('async-listen')
const { URL } = require('url')
const test = require('ava')
const got = require('got').extend({ retry: 0 })

const { createConfig: createMockConfig } = require('../helpers')
const { createTom, createConfig, createServer, createRoutes } = require('../..')

const config = createConfig(createMockConfig())
const routes = createRoutes(config)

const getApiUrl = async () => listen(await createServer(routes))

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

test('unmatched route', async t => {
  const apiUrl = await getApiUrl()
  const { statusCode, body } = await got(new URL('/foo/bar', apiUrl), {
    throwHttpErrors: false,
    responseType: 'json'
  })
  t.is(statusCode, 405)
  t.deepEqual(body, { status: 'fail', message: 'HTTP Method Not Allowed' })
})
