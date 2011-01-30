
path = require('path')
fs = require('fs')
main = path.join(path.dirname(fs.realpathSync(__filename)), '../../')
lib = main + "lib/"

testCase = require('nodeunit').testCase

markdown = require lib + "markdown"

module.exports = testCase((()->

    "headers": (test) ->

      test.ok  (markdown.makeHtml('1 header\n========', true).match /<h1>/)?, "H1 Header <= duouble underlined"
      test.ok  (markdown.makeHtml('2 header\n--------', true).match /<h2>/)?, "H2 Header <= single underlined"
      test.ok  (markdown.makeHtml('#  header',true).match /<h1>/)?, "H1 Header <= # "
      test.ok  (markdown.makeHtml('##  header',true).match /<h2>/)?, "H2 Header <= # "
      test.ok  (markdown.makeHtml('###  header',true).match /<h3>/)?, "H3 Header <= # "
      test.ok  (markdown.makeHtml('####  header',true).match /<h4>/)?, "H4 Header <= # "
      test.ok  (markdown.makeHtml('##### header',true).match /<h5>/)?, "H5 Header <= # "
      test.ok  (markdown.makeHtml('######  header',true).match /<h6>/)?, "H6 Header <= # "

      test.done()


)())
