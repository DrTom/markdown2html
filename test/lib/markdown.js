var fs, lib, main, markdown, path, testCase;
path = require('path');
fs = require('fs');
main = path.join(path.dirname(fs.realpathSync(__filename)), '../../');
lib = main + "lib/";
testCase = require('nodeunit').testCase;
markdown = require(lib + "markdown");
module.exports = testCase((function() {
  return {
    "headers": function(test) {
      test.ok((markdown.makeHtml('1 header\n========', true).match(/<h1>/)) != null, "H1 Header <= duouble underlined");
      test.ok((markdown.makeHtml('2 header\n--------', true).match(/<h2>/)) != null, "H2 Header <= single underlined");
      test.ok((markdown.makeHtml('#  header', true).match(/<h1>/)) != null, "H1 Header <= # ");
      test.ok((markdown.makeHtml('##  header', true).match(/<h2>/)) != null, "H2 Header <= # ");
      test.ok((markdown.makeHtml('###  header', true).match(/<h3>/)) != null, "H3 Header <= # ");
      test.ok((markdown.makeHtml('####  header', true).match(/<h4>/)) != null, "H4 Header <= # ");
      test.ok((markdown.makeHtml('##### header', true).match(/<h5>/)) != null, "H5 Header <= # ");
      test.ok((markdown.makeHtml('######  header', true).match(/<h6>/)) != null, "H6 Header <= # ");
      return test.done();
    }
  };
})());