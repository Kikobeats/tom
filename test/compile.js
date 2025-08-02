'use strict'

const test = require('ava')

const compile = require('../src/compile')

test('replace variables from template', t => {
  const template = {
    subject: '[microlink] {props.usedPercent}% API quota reached',
    from: '"{company.name}" {company.email}',
    cc: '{company.email}',
    body: {
      intro: [
        'Your plan has reached <b>{props.usedPercent}</b>% of the API quota.',
        'You’ve consumed <b>{props.used}</b> of <b>{props.limit}</b> total requests.',
        "Your quota will reset in <b>{props.remainDays}</b>. We recommend you to upgrade your plan. Otherwise, if you will wait until quota reset when <a target='_blank' href='https://microlink.io/docs/api/basics/rate-limit'>rate limit</a> is reached."
      ],
      outro: [
        "For upgradeing your plan, just reply this email or enter in our <a target='_blank' href='https://chat.microlink.io/'>chat</a>, we’d love to assist you."
      ]
    }
  }

  const config = {
    company: {
      name: 'Microlink',
      site: 'microlink.io',
      link: 'https://microlink.io',
      logo: 'https://cdn.microlink.io/logo/logo.png',
      api: 'https://api.microlink.io',
      email: 'hello@microlink.io',
      country: 'es',
      tax_type: 'vatmoss',
      copyright: 'Copyright © 2020 Microlink. All rights reserved.'
    }
  }

  const opts = {
    templateId: 'quota_notification',
    to: 'kikohumanbeatbox@gmail.com',
    usedPercent: 105,
    remainDays: '7 days',
    used: '14,116',
    limit: '14,000',
    planName: 'Professional 500 (M)'
  }

  t.snapshot(compile(template, { config, opts }))
})

test('serialize table', t => {
  const template = {
    subject: '[microlink] {props.usedPercent}% API quota reached',
    from: '"{company.name}" {company.email}',
    cc: '{company.email}',
    body: {
      intro: [
        'Your plan has reached <b>{props.usedPercent}</b>% of the API quota.',
        'You’ve consumed <b>{props.used}</b> of <b>{props.limit}</b> total requests.',
        "Your quota will reset in <b>{props.remainDays}</b>. We recommend you to upgrade your plan. Otherwise, if you will wait until quota reset when <a target='_blank' href='https://microlink.io/docs/api/basics/rate-limit'>rate limit</a> is reached."
      ],
      table: {
        data: '{props.quotas}'
      },
      outro: [
        "For upgradeing your plan, just reply this email or enter in our <a target='_blank' href='https://chat.microlink.io/'>chat</a>, we’d love to assist you."
      ]
    }
  }

  const config = {
    company: {
      name: 'Microlink',
      site: 'microlink.io',
      link: 'https://microlink.io',
      logo: 'https://cdn.microlink.io/logo/logo.png',
      api: 'https://api.microlink.io',
      email: 'hello@microlink.io',
      country: 'es',
      tax_type: 'vatmoss',
      copyright: 'Copyright © 2020 Microlink. All rights reserved.'
    }
  }

  const opts = {
    templateId: 'quota_notification',
    to: 'kikohumanbeatbox@gmail.com',
    usedPercent: 105,
    remainDays: '7 days',
    used: '14,116',
    limit: '14,000',
    planName: 'Professional 500 (M)',
    quotas: [
      {
        name: 'Professional 500 (M)',
        used: '14,116',
        limit: '14,000'
      },
      {
        name: 'Professional 1K (M)',
        used: '14,116',
        limit: '28,000'
      }
    ]
  }

  const result = compile(template, { config, opts })

  t.deepEqual(result.body.table.data, [
    {
      name: 'Professional 500 (M)',
      used: '14,116',
      limit: '14,000'
    },
    {
      name: 'Professional 1K (M)',
      used: '14,116',
      limit: '28,000'
    }
  ])
})
