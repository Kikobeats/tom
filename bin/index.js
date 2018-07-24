#!/usr/bin/env node

'use strict'

const { get } = require('lodash')

const { printError, createLog } = require('../src/log')
const withProcess = require('../src/interface/process')
const loadConfig = require('../src/config/load')

const createServer = require('./server')
const pkg = require('../package.json')
const createTom = require('../src')
const logo = require('./logo')

const isProduction = process.env.NODE_ENV === 'production'

if (!isProduction) require('update-notifier')({ pkg }).notify()

const cli = require('meow')(require('./help'), {
  pkg,
  description: false,
  flags: {
    port: {
      type: 'number',
      alias: 'p',
      default: process.env.TOM_PORT || 3000
    },
    silent: {
      alias: 's',
      type: 'boolean',
      default: false
    },
    config: {
      alias: 'c',
      type: 'string',
      default: process.cwd()
    },
    version: {
      alias: 'v'
    },
    help: {
      alias: 'h'
    }
  }
})
;(async () => {
  const { silent, command } = cli.flags

  if (!command) {
    return createServer(cli.flags, port => {
      if (!silent) {
        console.log(
          logo({
            header: `tom microservice is running`,
            description: `http://localhost:${port}`
          })
        )
      }
    })
  }

  const initialize = async () => {
    try {
      const config = await loadConfig(cli.flags.config)
      const tom = createTom(config)
      return tom
    } catch (err) {
      printError({ log: createLog({ keyword: 'tom' }), err })
      process.exit(err.code || 1)
    }
  }

  const tom = await initialize()
  const fn = get(tom, command)
  if (!fn) return cli.showHelp()
  return withProcess({ fn, opts: cli.flags })
})()
