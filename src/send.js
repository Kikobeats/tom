'use strict'

const send = require('send-http')

send.fail = (res, data, statusCode = 400) => {
  send(res, statusCode, {
    status: 'fail',
    ...data
  })
}

send.error = (res, data, statusCode = 500) => {
  send(res, statusCode, {
    status: 'error',
    ...data
  })
}

send.success = (res, data, statusCode = 200) => {
  send(res, statusCode, {
    status: 'success',
    ...data
  })
}

module.exports = send
