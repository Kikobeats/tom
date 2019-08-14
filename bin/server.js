#!/usr/bin/env node

'use strict'

const express = require('express')
const createRoutes = require('../src/routes')

module.exports = async () => {
  const routes = await createRoutes()
  return express()
    .use(routes)
    .disable('x-powered-by')
}
