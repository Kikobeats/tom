'use strict'

const getDefaultConfig = () => ({
  company: {
    name: 'tom',
    site: 'tom.js.org',
    link: 'https://tom.js.org',
    logo: 'https://tom.js.org/static/logo-mono.png',
    email: 'hello@microlink.io',
    copyright: 'Copyright © 2018 Tom. All rights reserved.'
  },
  email: {
    theme: 'salted',
    template: {
      payment_success: {
        subject: 'Welcome to {company.site}',
        from: '{company.email}',
        bcc: '{company.email}',
        body: {
          greeting: 'Hello',
          intro: [
            'Welcome to {company.site} and thanks for signing up! We really appreciate it.',
            'We are creating your API credentials. You will receive a new email in the next 24 hours with the API key.'
          ]
        }
      }
    },
    transporter: {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false
    }
  }
})

module.exports = fn => tom => {
  const config = getDefaultConfig()
  tom.setConfig(config)
  fn({ config, tom })
}
