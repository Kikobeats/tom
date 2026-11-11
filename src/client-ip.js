'use strict'

const { isIP } = require('net')
const requestIp = require('request-ip')

const CLOUDFLARE_CLIENT_IP = 'cf-connecting-ip'

module.exports = req => {
  const cloudflareIp = req.headers[CLOUDFLARE_CLIENT_IP]
  return isIP(cloudflareIp ?? '') === 0 ? requestIp.getClientIp(req) : cloudflareIp
}
