'use strict'

const { includes, get, isNil } = require('lodash')
const Twit = require('twit')

const { ward, wardCredential, is } = require('../../ward')
const compile = require('../../compile')

module.exports = ({ config }) => {
  const errFn = wardCredential(config, [
    { key: 'twitter.consumer_key', env: 'TOM_TWITTER_CONSUMER_KEY' },
    { key: 'twitter.consumer_secret', env: 'TOM_TWITTER_CONSUMER_SECRET' },
    { key: 'twitter.access_token', env: 'TOM_TWITTER_ACCESS_TOKEN' },
    {
      key: 'twitter.access_token_secret',
      env: 'TOM_TWITTER_ACCESS_TOKEN_SECRET'
    }
  ])

  if (errFn) return errFn

  const templates = get(config, 'twitter.template')

  const twit = new Twit({
    consumer_key: get(config, 'twitter.consumer_key'),
    consumer_secret: get(config, 'twitter.consumer_secret'),
    access_token: get(config, 'twitter.access_token'),
    access_token_secret: get(config, 'twitter.access_token_secret')
  })

  const apiEndpoint = {
    tweet: async ({ text: status, ...props }) => {
      const { data } = await twit.post('statuses/update', { ...props, status })
      const { id_str: id, user, text } = data
      const tweetUrl = `https://twitter.com/${user.screen_name}/status/${id}`
      return { text, tweetUrl }
    },
    dm: async ({ recipientId, text: message }) => {
      const { data } = await twit.post('direct_messages/events/new', {
        event: {
          type: 'message_create',
          message_create: {
            target: { recipient_id: recipientId },
            message_data: { text: message }
          }
        }
      })

      const { text } = data.event.message_create.message_data
      return { text }
    }
  }

  const twitter = async opts => {
    ward(opts.type, {
      label: 'type',
      test: is.string.is(x => includes(['tweet', 'dm'], x))
    })

    if (opts.templateId) {
      ward(opts.templateId, {
        label: 'templateId',
        test: is.string.is(x => !isNil(get(templates, x))),
        message: `Template '${opts.templateId}' not previously declared.`
      })
    }

    const template = get(templates, opts.templateId)
    const { type, ...props } = compile(template, { config, opts })

    const payload = await apiEndpoint[type](props)
    return payload
  }

  return twitter
}
