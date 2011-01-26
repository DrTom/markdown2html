/*

   markdown2html utility

   (c) 2011,  Dr. Thomas Schank

*/var child_process, exec, fs, lib, main, path, vendorlib;
child_process = require('child_process');
exec = child_process.exec;
path = require('path');
fs = require('fs');
main = path.join(path.dirname(fs.realpathSync(__filename)), '../');
lib = main + "lib/";
vendorlib = main + "vendor/lib/";
exports.run = function() {
  var css, enableTexMath, filecontentOrValue, head, headAppend, infile, markdown, node_markdown, options, outfile, script, simplecli, tail, tailPrepend, title, wrap, wrapInWikistyle;
  simplecli = require('simplecli');
  node_markdown = require("node-markdown").Markdown;
  markdown = require(lib + "markdown");
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
    return '<!DOCTYPE HTML>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title> ' + title + ' </title> ' + css.css() + '\n' + script.script() + '\n</head>\n\n<body>\n\n' + headAppend;
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
    }, {
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
  simplecli.argparser.parse({
    options: options,
    help: true
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
      html = markdown.makeHtml(data);
      if (!(html != null)) {
        console.log("failed to convert to html");
        return process.exit(-1);
      } else {
        if (wrap) {
          html = head() + html + tail();
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