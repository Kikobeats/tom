#!/usr/bin/env node

'use strict'

const express = require('express')
const createRoutes = require('../src/routes')

module.exports = ({ port }, fn) => {
  const app = express()
  createRoutes(app, express)
  return app.listen(port, fn(port))
}
