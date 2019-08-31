/* global codecopy */

window.$docsify = {
  name: 'tom',
  logo: 'https://tom.js.org/static/logo-color.png',
  repo: 'kikobeats/tom',
  maxLevel: 4,
  executeScript: true,
  auto2top: true,
  plugins: [
    function (hook, vm) {
      hook.ready(function () {
        codecopy('pre')
      })
    }
  ]
}
