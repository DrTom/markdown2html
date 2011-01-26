var fs, lib, main, path, showdown, vendorlib;
path = require('path');
fs = require('fs');
main = path.join(path.dirname(fs.realpathSync(__filename)), '../');
lib = main + "lib/";
vendorlib = main + "vendor/lib/";
showdown = require(vendorlib + "showdown");
exports.makeHtml = showdown.makeHtml;