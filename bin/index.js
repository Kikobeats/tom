#!/usr/bin/env node

'use strict'

const { get } = require('lodash')

const { printError, createLog } = require('../src/log')
const withProcess = require('../src/interface/process')
const loadConfig = require('../src/config/load')

const listen = require('./listen')
const pkg = require('../package.json')
const createTom = require('../src')

const isProduction = process.env.NODE_ENV === 'production'

if (!isProduction) require('update-notifier')({ pkg }).notify()

const cli = require('meow')(require('./help'), {
  pkg,
  description: false,
  flags: {
    port: {
      type: 'number',
      alias: 'p'
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

const main = async () => {
  const { command } = cli.flags
  const tomConfig = await loadConfig(cli.flags.config)
  if (!command) return listen(tomConfig, cli.flags)

  const tom = createTom(tomConfig)
  const fn = get(tom, command)
  if (!fn) return cli.showHelp()
  return withProcess({ fn, opts: cli.flags })
}

main().catch(err => {
  printError({ log: createLog({ keyword: 'tom' }), err })
  process.exit(err.code || 1)
})
