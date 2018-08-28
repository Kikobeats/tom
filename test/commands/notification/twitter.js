'use strict'

const test = require('ava')
const { chain } = require('lodash')

const createConfig = require('../../helpers/create-config')
const createTom = require('../../../')

const Twit = require('twit')

const twit = new Twit({
  consumer_key: process.env.TOM_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TOM_TWITTER_CONSUMER_SECRET,
  access_token: process.env.TOM_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TOM_TWITTER_ACCESS_TOKEN_SECRET
})

const getRandomTweetStatus = async () => {
  const payload = await twit.get('search/tweets', {
<<<<<<< HEAD
    q: 'javascript,nodejs',
=======
    q: 'nodejs OR javascript',
>>>>>>> Add Twitter integration
    count: 100
  })
  const { statuses } = payload.data

  const tweet = chain(statuses)
    .filter(({ text }) => !text.includes('@') && !text.includes('#'))
    .orderBy('retweet_count', 'desc')
    .sample()
    .value()

  return `${Date.now()} – ${tweet.text}`
}

test('tweet', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('notification:twitter', ({ text, tweetUrl }) => {
      t.is(typeof tweetUrl, 'string')
      t.is(typeof text, 'string')
    })
  })

  const tom = createTom(config)

  await tom.notification.twitter({
    text: await getRandomTweetStatus(),
    type: 'tweet'
  })
})

test('dm', async t => {
  const config = createConfig(({ config, tom }) => {
    tom.on('notification:twitter', ({ text }) => {
      t.is(typeof text, 'string')
    })
  })

  const tom = createTom(config)

  await tom.notification.twitter({
    type: 'dm',
<<<<<<< HEAD
    recipientId: '722024185644597248', // @kikobits
=======
    recipientId: process.env.TEST_TWITTER_USER_ID,
>>>>>>> Add Twitter integration
    text: 'are you there'
  })
})
