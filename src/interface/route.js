'use strict'

const { isArray, pick } = require('lodash')
const isBuffer = require('is-buffer')

module.exports = ({ fn, tom }) => async (req, res) => {
  let status
  const payload = {}

  try {
    const body = isBuffer(req.body) ? { body: req.body } : req.body
    const props = pick(req, ['ipAddress', 'headers'])

    const opts = isArray(body)
      ? { commands: body, ...props }
      : { ...body, ...props }

    const res = await fn(opts)
    payload.data = res
    status = 200
  } catch (err) {
    payload.message = err.message || err
    status = 400
  }

  return res.status(status).send({ status, ...payload })
}
