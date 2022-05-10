#!/usr/bin/env node

'use strict'

const express = require('express')

const PORT =
  process.env.PORT || process.env.port || process.env.TOM_PORT || 3000

const createServer = routes =>
  express()
    .use(routes)
    .disable('x-powered-by')

module.exports = async (tomConfig, { port = PORT } = {}) => {
  const routes = require('../src/routes')(tomConfig)

  createServer(routes).listen(port, () => {
    console.log(
      require('./logo')({
        header: 'tom is running',
        description: `http://localhost:${port}`
      })
    )
  })
}

module.exports.createServer = createServer
