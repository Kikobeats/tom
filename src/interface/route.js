'use strict'

const { isArray, pick } = require('lodash')
const isBuffer = require('is-buffer')

const send = require('../send')

module.exports =
  ({ fn }) =>
    async (req, res) => {
      let status = 'success'
      const payload = {}

      try {
        const body = isBuffer(req.body) ? { body: req.body } : req.body
        const props = pick(req, ['ipAddress', 'headers'])

        const opts = isArray(body)
          ? { commands: body, ...props }
          : { ...body, ...props }

        const res = await fn(opts)
        payload.data = res
      } catch (error) {
        payload.message = error.message || error
        status = 'fail'
      }

      return send[status](res, payload)
    }
