'use strict'

const test = require('ava')
const {
  repo,
  sha,
  event = 'push',
  commit_message: commitMessage = 'Running slack from tests',
  pull_request_number: pullRequestNumber,
  branch,
  jobUrl,
  ci = 'local'
} = require('ci-env')

const { capitalize } = require('lodash')

const { createConfig } = require('../../helpers')
const createTom = require('../../../')

const { TEST_SLACK_WEBHOOK } = process.env

test('notification:slack', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('notification:slack', data => {
      t.is(data.status, 'ok')
    })
  })

  const tom = createTom(config)
  const text = 'Someone is running the tests 🙀'
  const webhook = TEST_SLACK_WEBHOOK

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: commitMessage
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*repo:* ${repo}\n*branch:* ${branch}\n*event:* ${event}\n`
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
          text: `${sha}`
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
          url: jobUrl
        }
      ]
    }
  ]

  if (event === 'push') await tom.notification.slack({ webhook, text, blocks })
})
