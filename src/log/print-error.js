'use strict'

const cleanStack = require('clean-stack')

module.exports = ({ log, err }) => {
  const { message, stack } = err
  if (stack) log.error(cleanStack(stack))
  else log.error(message)
}
