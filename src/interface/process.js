'use strict'

module.exports = async ({ fn, opts }) => {
  try {
    await fn(opts)
    process.exit()
  } catch (err) {
    process.exit(err.code || 1)
  }
}
