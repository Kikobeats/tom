#!/usr/bin/env node

'use strict'

const express = require('express')
const router = require('../src/router')

module.exports = express()
  .use(router)
  .disable('x-powered-by')
