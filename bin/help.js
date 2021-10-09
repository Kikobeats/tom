'use strict'

const colors = require('picocolors')

const logo = require('./logo')

module.exports = `
${colors.dim(logo({ header: 'tom microservice – https://tom.js.org' }))}

  ${colors.dim('Usage')}

    $ tom [<flags>] <command> [<args> ...]

  ${colors.dim('Options')}

    -c, --config        Specify a configuration file path
    -h, --help          Show this usage information
    -p, --port <n>      Port to listen on (defaults to 3000)
    -v, --version       Output the version number

  ${colors.dim('Examples')}

  ${colors.dim('–')} Run microservice on port 1337

    $ tom ${colors.dim('-p 1337')}

  ${colors.dim('–')} Send a email notification from CLI

    $ tom ${colors.dim(
      "--command=notification.email --templateId=welcome --to=hello@kikobeats.com --subject='hello world'"
    )}`
