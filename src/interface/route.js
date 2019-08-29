'use strict'

const isBuffer = require('is-buffer')

module.exports = ({ fn, tom }) => async (req, res) => {
  let status
  const payload = {}

  try {
    const opts = isBuffer(req.body)
      ? { body: req.body, headers: req.headers }
      : { ...req.body, headers: req.headers }
    const res = await fn(opts)
    payload.data = res
    status = 200
  } catch (err) {
    payload.message = err.message || err
    status = 400
  }

  return res.status(status).send({ status, ...payload })
}
