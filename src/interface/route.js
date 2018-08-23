'use strict'

module.exports = ({ fn, tom }) => async (req, res) => {
  let status
  let payload = {}

  try {
    const res = await fn(req.body)
    payload.data = res
    status = 200
  } catch (err) {
    payload.message = err.message || err
    status = 400
  }

  return res.status(status).send({ status, ...payload })
}
