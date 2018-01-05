'use strict'

/*eslint-disable */
const logo = `
  ___       ___       ___
 \/\\  \\     \/\\  \\     \/\\__\\
 \\:\\  \\   \/::\\  \\   \/::L_L_
 \/::\\__\\ \/:\/\\:\\__\\ \/:\/L:\\__\\
\/:\/\\\/__\/ \\:\\\/:\/  \/ \\\/_\/:\/  \/
\\\/__\/     \\::\/  \/    \/:\/  \/
           \\\/__\/     \\\/__\/
`
/* eslint-enable */

module.exports = ({ copyright = true, header, description } = {}) => {
  let str = logo
  if (header) str = str + '\n' + header
  if (description) str = str + '\n' + description
  return str + '\n'
}
