'use strict'

const logo = require('./logo')
const chalk = require('chalk')

module.exports = `
${chalk.dim(logo({ header: 'tom microservice – https://tom.js.org' }))}

  ${chalk.dim('Usage')}

    $ tom [<flags>] <command> [<args> ...]

  ${chalk.dim('Options')}

    -c, --config        Specify a configuration file path
    -h, --help          Show this usage information
    -p, --port <n>      Port to listen on (defaults to 3000)
    -s, --silent        Disable logging
    -v, --version       Output the version number

  ${chalk.dim('Examples')}

  ${chalk.dim('–')} Run microservice on port 1337

    $ tom ${chalk.dim('-p 1337')}

  ${chalk.dim('–')} Send a email notification from CLI

    $ tom ${chalk.dim(
    "--command=email --template=welcome --to=hello@kikobeats.com --subject='hello world'"
  )}

`
