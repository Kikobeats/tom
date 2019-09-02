'use strict'

const test = require('ava')

const { ward, is } = require('../src/ward')

test('passing test', async t => {
  t.throws(
    () => ward(undefined, { test: is.string.nonEmpty }),
    "Expected a valid 'input', got 'undefined'"
  )
  t.throws(
    () => ward(1, { test: is.number.is(x => x > 10) }),
    "Expected a valid 'input', got '1'"
  )
})

test('passing label', async t => {
  t.throws(
    () => ward(undefined, { label: 'plan', test: is.string.nonEmpty }),
    "Expected a valid 'plan', got 'undefined'"
  )
})

test('passing message', async t => {
  t.throws(
    () =>
      ward(undefined, {
        label: 'plan',
        test: is.string.nonEmpty,
        message: 'Need to specify a \'plan\' to use'
      }),
    "Need to specify a 'plan' to use, got 'undefined'"
  )
})
