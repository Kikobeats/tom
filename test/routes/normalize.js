'use strict'

const test = require('ava')

const normalize = require('../../src/routes/normalize')

test('from object', async t => {
  t.deepEqual(normalize({ plan_id: 123 }), { planId: 123 })
  t.deepEqual(normalize({ foo: { plan_id: 123 } }), { foo: { planId: 123 } })
  t.deepEqual(normalize({ foo: [{ plan_id: 123 }] }), {
    foo: [{ planId: 123 }]
  })
})

test('from array', async t => {
  t.deepEqual(normalize([{ plan_id: 123 }, { plan_id: 456 }]), [
    { planId: 123 },
    { planId: 456 }
  ])
})
