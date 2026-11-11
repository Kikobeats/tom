'use strict'

const test = require('ava')

const clientIp = require('../src/client-ip')

const request = (headers, remoteAddress = '10.0.0.1') => ({
  headers,
  socket: { remoteAddress },
  connection: { remoteAddress }
})

test('prefers the visitor IP Cloudflare sets over the edge in x-forwarded-for', t => {
  const req = request({
    'x-forwarded-for': '162.158.88.114',
    'cf-connecting-ip': '62.0.122.190'
  })
  t.is(clientIp(req), '62.0.122.190')
})

test('reads an IPv6 visitor from Cloudflare', t => {
  const req = request({
    'x-forwarded-for': '172.70.80.204',
    'cf-connecting-ip': '2607:fea8:3dde:3e00:9035:f45e:d382:8422'
  })
  t.is(clientIp(req), '2607:fea8:3dde:3e00:9035:f45e:d382:8422')
})

test('falls back to x-forwarded-for without Cloudflare', t => {
  t.is(clientIp(request({ 'x-forwarded-for': '8.8.8.8, 10.0.0.2' })), '8.8.8.8')
})

test('ignores a malformed Cloudflare header', t => {
  const req = request({ 'cf-connecting-ip': 'not-an-ip', 'x-forwarded-for': '8.8.8.8' })
  t.is(clientIp(req), '8.8.8.8')
})

test('falls back to the socket address with no headers', t => {
  t.is(clientIp(request({}, '9.9.9.9')), '9.9.9.9')
})
