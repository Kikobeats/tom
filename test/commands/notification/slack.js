'use strict'

const test = require('ava')

const {
  repo,
  sha,
  event = 'push',
  commit_message: commitMessage,
  branch,
  jobUrl,
  ci = 'local'
} = require('ci-env')

const { capitalize } = require('lodash')

const { createConfig } = require('../../helpers')
const createTom = require('../../../')

const { TEST_SLACK_WEBHOOK } = process.env

event === 'push' &&
  test('notification:slack', async t => {
    t.plan(1)

    const config = createConfig(({ config, tom }) => {
      tom.on('notification:slack', data => {
        t.is(data.status, 'ok')
      })
    })

    const tom = createTom(config)
    const webhook = TEST_SLACK_WEBHOOK

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: commitMessage || 'Running slack from tests'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*repo:* ${repo}\n*branch:* ${branch}\n*event:* ${event}`
        },
        accessory: {
          type: 'image',
          image_url: 'https://tom.js.org/static/logo-color.png',
          alt_text: 'tom logo'
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `sha: ${sha}`
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: true,
              text: `See on ${capitalize(ci)}`
            },
            style: 'primary',
            url:
              jobUrl ||
              `https://github.com/Kikobeats/tom/runs/${process.env.GITHUB_RUN_ID}?check_suite_focus=true`
          }
        ]
      }
    ]

    const attachments = [{ blocks, color: '#2eb886' }]
    await tom.notification.slack({ webhook, attachments })
  })
