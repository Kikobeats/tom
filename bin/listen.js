#!/usr/bin/env node

'use strict'

const { createServer } = require('http')

const PORT =
  process.env.PORT || process.env.port || process.env.TOM_PORT || 3000

module.exports = async (tomConfig, { port = PORT } = {}) => {
  const routes = require('../src/routes')(tomConfig)
  const server = createServer(routes)

  server.listen(port, () => {
    console.log(
      require('./logo')({
        header: 'tom is running',
        description: `http://localhost:${port}`
      })
    )
  })
}

module.exports.createServer = createServer
