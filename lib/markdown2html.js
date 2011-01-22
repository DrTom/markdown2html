/*

   markdown2html utility

   (c) 2011,  Dr. Thomas Schank

*/exports.run = function() {
  var css, filecontentOrValue, fs, head, infile, md, options, outfile, simplecli, tail, title, wrap;
  simplecli = require('simplecli');
  fs = require('fs');
  md = require("node-markdown").Markdown;
  infile = void 0;
  outfile = void 0;
  wrap = false;
  title = "";
  css = (function() {
    var s;
    s = "";
    return {
      include: function(cssString) {
        return s += '\n<style type="text/css">\n' + cssString + '\n</style>\n';
      },
      css: function() {
        return s;
      }
    };
  })();
  filecontentOrValue = function(value) {
    var r;
    try {
      return r = fs.readFileSync(value, 'utf8');
    } catch (error) {
      return r = value;
    }
  };
  head = function() {
    return '<!DOCTYPE HTML>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title> ' + title + ' </title> \
' + css.css() + '\n</head>\n\n<body>\n\n';
  };
  tail = "\n</body>\n</html>";
  options = [
    {
      short: 'w',
      long: 'wrap',
      description: 'wraps content in <html><body> and so forth',
      callback: function() {
        return wrap = true;
      }
    }, {
      short: 't',
      long: 'title',
      description: 'specifies title for header',
      value: true,
      callback: function(value) {
        return title = value;
      }
    }, {
      short: 's',
      long: 'style',
      description: 'inlines css-styling, either given as the value or in a file; the path of the file would be given as the value then',
      value: true,
      callback: function(value) {
        wrap = true;
        return css.include(filecontentOrValue(value));
      }
    }, {
      short: "i",
      long: "infile",
      value: true,
      callback: function(value) {
        return infile = value;
      }
    }, {
      short: "o",
      long: "outfile",
      value: true,
      callback: function(value) {
        return outfile = value;
      }
    }
  ];
  simplecli.argparser.parse({
    options: options
  });
  if (!(infile != null)) {
    console.log("infile required");
    process.exit(-1);
  }
  outfile = outfile || infile.replace(/\.(md|mkd|markdown)$/i, ".html");
  if (infile === outfile) {
    console.log("failed determine outfile name");
    process.exit(-1);
  }
  return fs.readFile(infile, 'utf8', function(err, data) {
    var html;
    if (err != null) {
      console.log("failed to read: " + infile);
      return process.exit(-1);
    } else {
      html = md(data, true);
      if (!(html != null)) {
        console.log("failed to convert to html");
        return process.exit(-1);
      } else {
        if (wrap) {
          html = head() + html + tail;
        }
        return fs.writeFile(outfile, html, function(err) {
          if (err != null) {
            console.log("failed to write " + outfile);
            return process.exit(-1);
          } else {
            return console.log("successfully written " + outfile);
          }
        });
      }
    }
  });
};