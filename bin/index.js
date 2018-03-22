#!/usr/bin/env node

'use strict'

const { get, keys, includes } = require('lodash')

const { createLog, loadConfig, wrapAction } = require('../src/helpers')
const createServer = require('./server')
const pkg = require('../package.json')
const loadCommand = require('../src')
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
      default: process.env.PORT || 3000
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

  const config = await loadConfig(cli.flags.config)
  const commands = loadCommand(config)

  const fn = get(commands, command)
  if (!fn) return cli.showHelp()

  const log = createLog({ keyword: command })

  return wrapAction({
    fn,
    log,
    opts: cli.flags,
    onSuccess: () => process.exit(0),
    onFail: err => process.exit(err.code || 1)
  })
})()
