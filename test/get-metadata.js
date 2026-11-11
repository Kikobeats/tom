'use strict'

const test = require('ava')

const getMetadata = require('../src/get-metadata')

test('stores the country and never the IP address', async t => {
  const metadata = await getMetadata({ ipAddress: '62.0.122.190', headers: { 'cf-ipcountry': 'ES' } })
  t.deepEqual(metadata, { country: 'ES' })
})

test('falls back to the IP address to find the country', async t => {
  const metadata = await getMetadata({ ipAddress: '8.8.8.8', headers: {} })
  t.deepEqual(metadata, { country: 'US' })
})
