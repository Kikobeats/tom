# tom-microservice

<p align="center">
  <img src="https://i.imgur.com/qrr67O7.png" alt="tom">
  <br>
</p>

![Last version](https://img.shields.io/github/tag/Kikobeats/tom-microservice.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/Kikobeats/tom-microservice/master.svg?style=flat-square)](https://travis-ci.org/Kikobeats/tom-microservice)
[![Dependency status](https://img.shields.io/david/Kikobeats/tom-microservice.svg?style=flat-square)](https://david-dm.org/Kikobeats/tom-microservice)
[![Dev Dependencies Status](https://img.shields.io/david/dev/Kikobeats/tom-microservice.svg?style=flat-square)](https://david-dm.org/Kikobeats/tom-microservice#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/tom-microservice.svg?style=flat-square)](https://www.npmjs.org/package/tom-microservice)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/Kikobeats)

> **tom** is a tiny microservice for handle the payment process of your application.

## Install

```bash
$ npm install tom-microservice
```

## Usage

**tom** creates customers, subscriptions plans & send notifications.

You can consume **tom** from different ways.

### as microservice

Just execute `tom` and the server will be start:

```bash
$ tom

    ___       ___       ___
   /\  \     /\  \     /\__\
   \:\  \   /::\  \   /::L_L_
   /::\__\ /:/\:\__\ /:/L:\__\
  /:/\/__/ \:\/:/  / \/_/:/  /
  \/__/     \::/  /    /:/  /
             \/__/     \/__/

  tom microservice is running
  http://localhost:3000
```

To view details for a command at any time use `tom --help`

Also declare it as part of your npm scripts:

```json
{
  "scripts": {
    "start": "tom"
  }
}
```

### from CLI

You can execute `tom` as CLI to resolve the same functionality than the microservice endpoint:

```bash
$ tom --command=email --template=welcome --to=hello@kikobeats.com --subject='hello world'
```

To view details for a command at any time use `tom --help`

### from Node.js

```js
// First of all you need to declare a configuration file.
const config = {/* See configuration section */}

// Pass configuration file to `tom-microservice` module.
const tom = require('tom-microservice')(config)

// Now you can access `tom` commands
const {payment, email} = tom
```

## Configuration

All the **tom** actions are based on a configuration file.

You can define the configuration file via:

- A `.tomrc` file, written in YAML or JSON, with optional extensions: .yaml/.yml/.json/.js.
- A `tom.config.js` file that exports an object.
- A `tom` key in your package.json file.

You can combine it with [config](https://www.npmjs.com/package/config) to get different configurations based on environments.

A **tom** configuration file need to have the followings properties:

### company

It's the basic information related with your company.

```yaml
company:
  name: microlink
  site: microlink.io
  link: https://microlink.io
  logo: https://microlink.io/logo.png
  email: hello@microlink.io
  copyright: Copyright © 2018 Microlink. All rights reserved.
```

We use this information across **tom** commands, so declare it is important.

### payment

Payments are processed using [Stripe](https://stripe.com).

At least you need to attach your [stripe key of your account](https://dashboard.stripe.com/account/apikeys):

```yaml
payment:
  stripe_key: YourStripeApiKey
```

### email

Emails will be sent using [nodemailer](https://github.com/nodemailer/nodemailer).

Under non production scenario, you can view a preview of the email sent.

First of all, you need to specify your `transporter`:

```yaml
email:
  transporter:
    host: smtp.ethereal.email
    port: 587
    secure: false
    auth:
      user: myuser@ethereal.email
      pass: mypassword
```

In addition, we use [mailgen](https://github.com/eladnava/mailgen) for generate fancy transactional emails. You have [different themes availables](https://github.com/eladnava/mailgen#supported-themes). Need to specify one to use:

```yaml
email:
  theme: default
```

Emails will be sent based on a template. Declare many templates as you want.

You can reference other config properties or options inside the template:

```yaml
email:  
  templates:
    payment_success:
      subject: Welcome to {company.site}
      from:
        - "{company.email}"
      bcc:
        - "{company.email}"
      body:
        greeting: Hello
        signature: Regards
        intro:
          - Welcome to {company.site} and thanks for signing up! We really appreciate it.
          - We are creating your API credentials. You will receive a new email in the next 24 hours with the API key.

    send_api_key:
      subject: Your API Key
      body:
        greeting: Hello
        signature: Regards
        intro:
          - Your API Token is {props.apiKey}.
          - You need to attach it as header in all your requests.
          - See more at <a href="https://docs.microlink.io">https://docs.microlink.io</a>.
        outro:
          - Need help, or have questions? Just reply to this email, we'd love to help.
```

## Commands

### /payment

![](https://i.imgur.com/lVsdsn7.png)

It handles all the logic related to subscription creation related to users.

#### /payment/create

<small>`POST`</small>

It handles your payment process, creating new customer and subscribe them to your pricing plans.

The endpoint expect receive a valid Stripe token.

You can connect it easily with your frontend using [Stripe Checkout](https://stripe.com/checkout).


#### Data Parameters
  
##### plan

*Required*</br>
type: `integer`

Your stripe plan subscription id.

##### token

*Required*</br>
type: `object`

The [token Object](https://stripe.com/docs/api#tokens) generated by Stripe.

##### email_template

Type: `string`

If it is present, it will be generate a email notification as well, using the new customer information.

#### /payment/update

<small>`POST`</small>

It will associate a new card with a customer.

The endpoint expect receive a valid Stripe token.

#### Data Parameters

##### user_id

*Required*</br>
type: `string`

The unique identifier associated with the customer.

##### token

*Required*</br>
type: `object`

The [token Object](https://stripe.com/docs/api#tokens) generated by Stripe.

##### email_template

Type: `string`

If it is present, it will be generate a email notification as well, using the new customer information.

### /notification

![](https://i.imgur.com/l13bRpK.png)

It handles all the logic related with notify users

#### /notification/email

<small>`POST`</small>

It sends transactional emails based on templates.

Under non production scenario, you can use [ethereal](https://ethereal.email/) as transporter and it will be generate a preview of the email sent.

#### Data Params

##### template

*Required*</br>
type: `string`

The mail template to use declared on your configuration file.

##### from

type: `string`</br>
default: `onfig.email.templates[template].from`

The creator of the mail.
  
##### to

type: `array`</br>
default: `company.email`

The recipients of the mail.

##### cc

type: `array`</br>
default: `config.email.templates[template].cc`

Carbon copy recipients of the mail.

##### bcc

type: `array`</br>
default: `config.email.templates[template].cc`

Blind carbon copy recipients of the mail.

##### subject

type: `string`</br>
default: `config.email.templates[template].subject`

The email subject.

##### attachments

type: `array`</br>
default: `req.body.attachments`

An array of attachment objects (see [nodemailer#attachments](https://nodemailer.com/message/attachments/) for details).

Attachments can be used for embedding images as well.

## Environment Variables

### API_KEY

Type: `string` </br>
Default: `undefined`

When you provide it, all request to **tom** need to be authenticated using `x-api-key` header and the value provided.

You can use [randomkeygen.com](https://randomkeygen.com) for that.

### PORT

Type: `number` </br>
Default: `3000`

The port to uses for run the HTTP microservice.

## License

**tom-microservice** © [Kiko Beats](https://kikobeats.com), Released under the [MIT](https://github.com/Kikobeats/tom-microservice/blob/master/LICENSE.md) License.<br>
Authored and maintained by Kiko Beats with help from [contributors](https://github.com/Kikobeats/tom-microservice/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [@Kiko Beats](https://github.com/Kikobeats) · Twitter [@Kikobeats](https://twitter.com/Kikobeats)
