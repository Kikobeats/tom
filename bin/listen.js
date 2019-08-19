#!/usr/bin/env node

'use strict'

const express = require('express')

const createRoutes = require('../src/routes')
const logo = require('./logo')

const PORT =
  process.env.PORT || process.env.port || process.env.TOM_PORT || 3000

module.exports = async (tomConfig, { port = PORT } = {}) => {
  const routes = await createRoutes(tomConfig)

  const app = express()
    .use(routes)
    .disable('x-powered-by')

  return app.listen(port, () => {
    console.log(
      logo({
        header: `tom is running`,
        description: `http://localhost:${port}`
      })
    )
  })
}
