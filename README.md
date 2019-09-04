<p align="center">
  <svg width="152" height="181" viewBox="0 0 152 181" xmlns="http://www.w3.org/2000/svg"><g transform="translate(1)" stroke="#f8aea4" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><circle stroke-width="2" cx="67.459" cy="97.686" r="66.526"/><path d="M65.15 164.212s-4.873 1.037-4.873 8.029c0 6.991 7.182 7.65 7.182 7.65 45.4 0 82.203-36.804 82.203-82.203 0 0 1.533-9.768-7.393-9.768-8.927 0-8.286 6.567-8.286 6.567" stroke-width="2"/><path d="M86.019 148.724v-4.767s.317-11.44-13.348-11.44h-30.19c-5.72 0-21.293-1.59-21.293-15.573V94.698h24.47s14.62 0 14.62-11.44V63.872h33.686s16.843-.318 16.843 19.703v31.144s-.954 8.263-12.394 8.263c-11.441 0-10.488-11.44-10.488-11.44V85.8" stroke-width="2"/><circle stroke-width="2" cx="75.374" cy="87.918" r="2.225"/><path d="M42.48 132.516s13.984-2.224 15.255-17.639" stroke-width="2"/><path d="M19.442 76.106s8.422-31.622 43.22-33.844"/><path d="M110.807 112.07h11.972" stroke-width="2"/><circle stroke-width="2" cx="133.986" cy="6.084" r="4.21"/><path d="M133.986 94.485V12.712" stroke-width="2"/></g></svg>
  <br>
  <br>
</p>

![Last version](https://img.shields.io/github/tag/Kikobeats/tom-microservice.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/Kikobeats/tom/master.svg?style=flat-square)](https://travis-ci.org/Kikobeats/tom)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/tom-microservice.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/tom-microservice)
[![Dependency status](https://img.shields.io/david/Kikobeats/tom-microservice.svg?style=flat-square)](https://david-dm.org/Kikobeats/tom-microservice)
[![Dev Dependencies Status](https://img.shields.io/david/dev/Kikobeats/tom-microservice.svg?style=flat-square)](https://david-dm.org/Kikobeats/tom-microservice#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/tom-microservice.svg?style=flat-square)](https://www.npmjs.org/package/tom-microservice)

**tom** 🐶 is a backoffice for your projects, oriented for doing things like:

- Handle [payments](#payment) workflow (  create customers, subscribe to plans) using Stripe.
- Send notifications ([email](notificationemail)/[Slack](notificationslack)/[Twitter](notificationtwitter)/[Telegram](notificationtelegram)), even based on a template.
- Easy to extend & customize using [Event System](#event-system).
- Chainable actions, running them on [series](batchseries) or [parallel](batchparallel).
- Expose it over [HTTP](as-microservice) or as [CLI](from-cli).

## Install

```bash
$ npm install tom-microservice
```

## Usage

You can consume **tom** 🐶 from different ways.

### as microservice

Just execute `tom` and the server will start:

![](https://i.imgur.com/qrr67O7.png)

To see details of a command use `tom --help`

Also declare it as part of your npm scripts:

```json
{
  "scripts": {
    "start": "tom"
  }
}
```

The microservice accepts command options in snake and camel case as body parameters.

### from CLI

You can execute `tom` as CLI to resolve the same functionality than the microservice endpoint:

```bash
$ tom --command=notification.email --templateId=welcome --to=hello@kikobeats.com --subject='hello world'
```

To view details for a command at any time use `tom --help`

### from Node.js

```js
// First of all you need to declare a configuration file.
const config = {/* See configuration section */}

// Pass configuration file to `tom-microservice` module.
const tom = require('tom-microservice')(config)

// Now you can access `tom` commands
const { payment, email } = tom
```

## Configuration

!> Use [config](https://www.npmjs.com/package/config) to load different configurations based on environments.

All the **tom** 🐶 actions are based on a configuration file.

You can define the configuration file via:

- A `.tomrc` file, written in YAML or JSON, with optional extensions: .yaml/.yml/.json/.js.
- A `tom.config.js` file that exports an object.
- A `tom` key in your package.json file.

The minimal configuration necessary is related with your company

```yaml
company:
  name: microlink
  site: microlink.io
  link: https://microlink.io
  logo: https://microlink.io/logo.png
  email: hello@microlink.io
  copyright: Copyright © 2018 Microlink. All rights reserved.
```

This information will be used across all the commands.

## Event System

!> Event System is only supported with `tom.config.js` configuration file.

Every time **tom** 🐶 execute a command successfully it will be emit an event:

```js
// Register stats for payment processed
tom.on('payment:create', async data => {
  const info = await sendAnalytics(data)
  return info
})
```

The `data` received will be the last command execution output.

The events system are designed to allow you perform async actions.

If you return something, then it will be added into the final payload, that will be printed at the log level.

The events emitted are of 3 hierarchical types:

```js
// An event emitted for a command under a category
tom.on('payment:create', sendAnalytics)

// An event emitted under a category
tom.on('payment', sendAnalytics)

// Any event
tom.on('*', sendAnalytics)
```

## Commands

The commands define what things you can do with **tom** 🐶.

Every command has his own field at [configuration](#configuration).

### payment

![](https://i.imgur.com/M4qyWPE.png)

It creates new customer and subcribe them to previous declared product plans, using Stripe.

In addition, **tom** 🐶 will fill useful customer metadata inforomation whetever is possible (such ass IP Address, country, region, VAT rate, currency code, etc.)

#### payment:create

<small>`POST`</small>

It handles are payment, expecting a Stripe [`Token`](https://stripe.com/docs/api/tokens/object), creating new a customer and subscribe it a previous created billing product.

##### Data Parameters

###### planId

*Required*</br>
type: `integer`

A previously created Stripe [`plan`](https://stripe.com/docs/api/plans/create) identifier.

###### token

*Required*</br>
type: [`Token`](https://stripe.com/docs/api#tokens)

The [`token`](https://stripe.com/docs/api#tokens) object generated by Stripe.

#### payment:update

<small>`POST`</small>

It will update the source update associated with a customer, based on a Stripe [`Token`](https://stripe.com/docs/api/tokens/object).

##### Data Parameters

###### customerId

*Required*</br>
type: `string`

A previously created Stripe [`customer`](https://stripe.com/docs/api/customers/create) identifier.

###### token

*Required*</br>
type: `object`

The [`token`](https://stripe.com/docs/api#tokens) object generated by Stripe.

#### payment:session

<small>`POST`</small>

It validates a Stripe [`session`](https://stripe.com/docs/api/checkout/sessions/object) previously created via [Stripe Checkout](https://stripe.com/docs/payments/checkout).

##### Data Parameters

###### sessionId

*Required*</br>
type: `string`

The Stripe [`session`](https://stripe.com/docs/api/checkout/sessions/create) identifier.

#### payment:webhook

<small>`POST`</small>

![](https://i.imgur.com/NSc3h8R.png)

It exposes an endpoint to be triggered by [Stripe Webhook](https://stripe.com/docs/webhooks).

For using Stripe webhook you need to [setup webhook in your account](https://stripe.com/docs/webhooks/setup#configure-webhook-settings).

Click `+ Add Endpoint` and the URL should the URL where **tom** 🐶 is deployed end by `payment/webhook` e.g., `tom.localtunnel.me/microlink.io/payment/webhook`.

The events to send need to be at least contain `checkout.session.completed`.

If you want to test the webhook locally, you can use [localtunnel](https://github.com/localtunnel/localtunnel) to expose your local server.

The [webhook signature](https://stripe.com/docs/webhooks/signatures) will be checked to verify that the events were sent by Stripe.

### notification

![](https://i.imgur.com/MmgFbS3.png)

It sends notification using different providers and transporters.

#### notification:email

<small>`POST`</small>

It sends transactional emails based on templates defined.

Under non production scenario, you can use [ethereal](https://ethereal.email/) as transporter and it will be generate a preview of the email sent.

##### Data Parameters

###### templateId

type: `string`

If it is present, it will be generate `text` and `html` using the template.

###### text

The plain text content version of the email notification.

###### html

The HTML content version of the email notification.

###### from

type: `string`</br>
default: `config.email.template[templateId].from`

The creator of the mail.

###### to

type: `array`</br>
default: `company.email`

The recipients of the mail.

###### cc

type: `array`</br>
default: `config.email.template[templateId].cc`

Carbon copy recipients of the mail.

###### bcc

type: `array`</br>
default: `config.email.template[templateId].cc`

Blind carbon copy recipients of the mail.

###### subject

type: `string`</br>
default: `config.email.template[templateId].subject`

The email subject.

###### attachments

type: `array`</br>
default: `req.body.attachments`

An array of attachment objects (see [nodemailer#attachments](https://nodemailer.com/message/attachments/) for details).

Attachments can be used for embedding images as well.

#### notification:slack

<small>`POST`</small>

It sends a Slack message.

##### Data Parameters

###### webhook

*Required*</br>
type: `string`

The [Incoming Webhook for Slack](https://api.slack.com/incoming-webhooks) used for sending the data.

###### templateId

Type: `string`

If it is present, it load a previous declared template.

###### text

type: `string`

The text of the message. 

It supports some specific formatting things, see [formatting text in messages](https://api.slack.com/messaging/composing/formatting).

###### blocks

type: `object`</br>

The [block structure](https://api.slack.com/reference/messaging/blocks) for creating rich messages, see [message layouts](https://api.slack.com/messaging/composing/layouts).

You can compose blocks structures quickly using [Slack Block Kit Builder](https://api.slack.com/tools/block-kit-builder).

#### notification:telegram

<small>`POST`</small>

It sends a telegram message to the specified chat id.

##### Data Parameters

###### templateId

type: `string`

If it is present, it will be generate `text` using the template.

###### chatId

*Required*</br>
type: `number`

The Telegram chat id that will receive the message.

###### text

*Required*</br>
type: `string`

The message that will be sent.

#### notification:twitter

<small>`POST`</small>

It sends a notification using Twitter as provider.

##### Data Parameters

###### templateId

type: `string`

If it is present, it will be generate `text` using the template.

###### text

*Required*</br>
type: `string`

The text of the message.

###### type

*Required*</br>
type: `string`

Choose one of the different ways the message can be send.

The types availables are `tweet` or `dm`.

###### recipientId

type: `string`

It defines the user that will be receive the message.

It is only necessary on `dm` mode.

### batch

It runs more than one command in the same action.

#### batch:parallel

<small>`POST`</small>

It runs all the commands in paralell, without waiting until the previous function has completed.

If any of the commands throw an error, the rest continue running.

##### Data Parameters

The commands should be provided as a collection:

```
[
	{
		"command": "notification.email",
		"templateId": "welcome",
		"to": "hello@kikobeats.com"
	}, {
		"command": "telegram",
		"templateId": "welcome",
		"to": "hello@kikobeats.com",
		"chatId": 1234
	}
]
```

The field `command` determine what command should be used while the rest of parameters provided will be passed through the command.

#### batch:series

<small>`POST`</small>

It runs all the commands in series, each one running once the previous function has completed, each passing its result to the next.

If any of the commands throw an error, no more functions are run.

##### Data Parameters

The commands should be provided as a collection:

```
[
	{
		"command": "notification.email",
		"templateId": "welcome",
		"to": "hello@kikobeats.com"
	}, {
		"command": "telegram",
		"templateId": "welcome",
		"to": "hello@kikobeats.com",
		"chatId": 1234
	}
]
```

The field `command` determine what command should be used while the rest of parameters provided will be passed through the command.

## Environment Variables

Some credentials could be provided as environment variables as well

### general 

#### TOM_ALLOWED_ORIGIN

Type: `boolean`|`string`|`regex`|`array` </br>
Default: `'*'`

It configures the `Access-Control-Allow-Origin` CORS.

See [cors](https://github.com/expressjs/cors#configuration-options) for more information.

#### TOM_API_KEY

Type: `string` </br>
Default: `undefined`

When you provide it, all request to **tom** 🐶 needs to be authenticated using `x-api-key` header and the value provided.

You can use [randomkeygen.com](https://randomkeygen.com) for that.

#### TOM_PORT

Type: `number` </br>
Default: `3000`

The port to uses for run the HTTP microservice.

### payment

#### TOM_STRIPE_KEY

Type: `string` </br>
Default: `config.payment.stripe_key`

The [Stripe key](https://dashboard.stripe.com/account/apikeys) associated with your account.

#### TOM_STRIPE_WEBHOOK_SECRET

Type: `string` </br>
Default: `config.payment.stripe_webhook_secret`

The [Stripe Webhook signature](https://stripe.com/docs/webhooks/signatures) for verifying events were sent by Stripe.

### notification

#### TOM_EMAIL_USER

Type: `string` </br>
Default: `config.email.transporter.auth.user`

Your SMTP authentication user credential.

#### TOM_EMAIL_PASSWORD

Type: `string` </br>
Default: `config.email.transporter.auth.password`

Your SMTP authentication password credential.

#### TOM_TWITTER_CONSUMER_KEY

Type: `string` </br>
Default: `config.twitter.consumer_key`

Your consumer secret key from [Twitter authentication credentials](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens.html).

#### TOM_TWITTER_CONSUMER_SECRET

Type: `string` </br>
Default: `config.twitter.consumer_secret`

Your consumer secret [Twitter authentication credentials](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens.html).

#### TOM_TWITTER_ACCESS_TOKEN_SECRET

Type: `string` </br>
Default: `config.twitter.access_token_secret`

Your access token secret from [Twitter authentication credentials](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens.html).

#### TOM_TWITTER_ACCESS_TOKEN

Type: `string` </br>
Default: `config.twitter.access_token`

Your access token from [Twitter authentication credentials](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens.html).

#### TOM_TELEGRAM_KEY

![](https://i.imgur.com/xRAqBs6.png)

Type: `string` </br>
Default: `config.telegram.token`

Your [Telegram @BotFather token](https://core.telegram.org/bots#3-how-do-i-create-a-bot).

## License

**tom** © [Kiko Beats](https://kikobeats.com), Released under the [MIT](https://github.com/Kikobeats/tom-microservice/blob/master/LICENSE.md) License.<br>

Spaceman logo by [Nook Fulloption](https://thenounproject.com/term/spaceman/854189) from [the Noun Project](https://thenounproject.com/search/?q=dog%20spaceman&i=854189#).

Authored and maintained by Kiko Beats with help from [contributors](https://github.com/Kikobeats/tom-microservice/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [@Kiko Beats](https://github.com/Kikobeats) · Twitter [@Kikobeats](https://twitter.com/Kikobeats)
