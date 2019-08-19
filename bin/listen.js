#!/usr/bin/env node

'use strict'

const express = require('express')

const createRoutes = require('../src/routes')
const logo = require('./logo')

const PORT =
  process.env.PORT || process.env.port || process.env.TOM_PORT || 3000

const createServer = routes =>
  express()
    .use(routes)
    .disable('x-powered-by')

module.exports = async (tomConfig, { port = PORT } = {}) => {
  const routes = await createRoutes(tomConfig)

  createServer(routes).listen(port, () => {
    console.log(
      logo({
        header: `tom is running`,
        description: `http://localhost:${port}`
      })
    )
  })
}

module.exports.createServer = createServer
