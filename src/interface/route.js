'use strict'

module.exports = ({ fn, eventType, tom }) => async (req, res) => {
  try {
    await fn(req.body)
    res.success(200)
  } catch (err) {
    res.fail({ message: err.message || err })
  }
}
