/*

   markdown2html utility

   (c) 2011,  Dr. Thomas Schank

*/var child_process, exec, fs, helpers, inBuffer, lib, main, markdown, outfile, path, readStdin, stringhelper, util, vendorlib;
child_process = require('child_process');
util = require('util');
exec = child_process.exec;
path = require('path');
fs = require('fs');
main = path.join(path.dirname(fs.realpathSync(__filename)), '../');
lib = main + "lib/";
vendorlib = main + "vendor/lib/";
helpers = require('drtoms-nodehelpers');
stringhelper = helpers.stringhelper;
markdown = require(lib + "markdown");
inBuffer = stringhelper.createStringBuffer();
readStdin = true;
outfile = void 0;
exports.run = function() {
  var css, enableTexMath, filecontentOrValue, head, headAppend, options, read, script, tail, tailPrepend, title, wrap, wrapInWikistyle, write;
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
  script = (function() {
    var s;
    s = "";
    return {
      include: function(link, script) {
        s += "\n<script" + (link != null ? " src='" + link + "'" : "") + ">\n";
        if (script != null) {
          s += script;
        }
        return s += "</script>\n";
      },
      script: function() {
        return s;
      }
    };
  })();
  enableTexMath = function(pathToMathJax) {
    return script.include(pathToMathJax, 'MathJax.Hub.Config({\n  extensions: ["tex2jax.js"],\n  jax: ["input/TeX","output/HTML-CSS"],\n  tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}\n});\n');
  };
  filecontentOrValue = function(value) {
    var r;
    try {
      return r = fs.readFileSync(value, 'utf8');
    } catch (error) {
      return r = value;
    }
  };
  headAppend = "";
  tailPrepend = "";
  head = function() {
    return '<!DOCTYPE HTML>\n<html>\n<head>\n  <meta charset="utf-8"/>\n  <title> ' + title + ' </title> ' + css.css() + '\n' + script.script() + '\n</head>\n\n<body>\n\n' + headAppend;
  };
  tail = function() {
    return tailPrepend + "\n</body>\n</html>";
  };
  wrapInWikistyle = function() {
    headAppend += "\n<div class='wikistyle'>\n";
    return tailPrepend = "\n</div>\n" + tailPrepend;
  };
  options = [
    {
      short: "i",
      long: "infile",
      description: "input file, can be repeated multiple times",
      value: true,
      callback: function(value) {
        readStdin = false;
        return inBuffer.append(fs.readFileSync(value, 'utf8'));
      }
    }, {
      short: "o",
      long: "outfile",
      value: true,
      callback: function(value) {
        return outfile = value;
      }
    }, {
      short: 'w',
      long: 'wrap',
      description: 'wraps con,tent in <html><body> and so forth',
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
      long: "enableTexMath",
      description: "enable mathematical notation in inline (la)tex style, requires path specification to MathJax.js",
      value: true,
      callback: function(value) {
        wrap = true;
        return enableTexMath(value);
      }
    }, {
      long: "styleGithubWikilike",
      callback: function() {
        wrap = true;
        wrapInWikistyle();
        return css.include(filecontentOrValue(lib + "styles/githubWikilike.css"));
      }
    }, {
      long: "styleSectionNumbers",
      callback: function() {
        wrap = true;
        return css.include(filecontentOrValue(lib + "styles/sectionNumbers.css"));
      }
    }
  ];
  helpers.argparser.parse({
    options: options,
    help: true
  });
  read = function(cont) {
    var stdin;
    if (readStdin) {
      stdin = process.openStdin();
      stdin.setEncoding('utf8');
      stdin.on('data', function(chunk) {
        return inBuffer.append(chunk);
      });
      return stdin.on('end', function() {
        return cont();
      });
    } else {
      return cont();
    }
  };
  write = function(html, cont) {
    if (!(outfile != null)) {
      process.stdout.write(html);
      return cont();
    } else {
      return fs.writeFile(outfile, html, 'utf8', function(err) {
        return cont();
      });
    }
  };
  return read(function(err) {
    var html;
    html = markdown.makeHtml(inBuffer.toString());
    if (wrap) {
      html = head() + html + tail();
    }
    return write(html, function(err) {});
  });
};