var DEBUG, adjustSpecialChars, fs, helpers, inBuffer, lib, main, outBuffer, parseString, path, print, println, sanitizeLatex, vendorlib, xml;
path = require('path');
fs = require('fs');
main = path.join(path.dirname(fs.realpathSync(__filename)), '../');
lib = main + "lib/";
vendorlib = main + "vendor/lib/";
xml = require(vendorlib + 'node-xml');
helpers = require('drtoms-nodehelpers');
println = helpers.printer.println;
print = helpers.printer.print;
inBuffer = helpers.stringhelper.createStringBuffer();
outBuffer = helpers.stringhelper.createStringBuffer();
DEBUG = false;
/* parsing */
parseString = function(input, cont) {
  var parser;
  parser = new xml.SaxParser(function(cb) {
    var getHrefAtt, noPrintStack, state;
    state = [];
    noPrintStack = [];
    cb.onEndDocument(function() {
      return cont();
    });
    getHrefAtt = function(attributes) {
      return attributes.filter(function(att) {
        var key, value;
        key = att[0], value = att[1];
        return key === "href";
      }).reduce((function(prev, att) {
        var key, value;
        key = att[0], value = att[1];
        return value;
      }), "");
    };
    cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
      var i;
      if (DEBUG) {
        require("sys").debug(((function() {
          var _ref, _results;
          _results = [];
          for (i = 1, _ref = state.length; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
            _results.push(">>");
          }
          return _results;
        })()).join("") + elem.toUpperCase());
      }
      if (elem === "a") {
        outBuffer.append("\\href{" + getHrefAtt(attrs) + "}{");
      }
      if (elem === "br") {
        outBuffer.append("\\newline{}");
      }
      if (elem === "code" && state[state.length - 1] !== "pre") {
        outBuffer.append("\\code{");
      }
      if (elem === "em") {
        outBuffer.append("{\\it ");
      }
      if (elem === "h1") {
        outBuffer.append("\\section{");
      }
      if (elem === "h2") {
        outBuffer.append("\\subsection{");
      }
      if (elem === "h3") {
        outBuffer.append("\\subsubsection{");
      }
      if (elem === "h4") {
        outBuffer.append("\\paragraph{");
      }
      if (elem === "h5") {
        outBuffer.append("\\paragraph{");
      }
      if (elem === "h6") {
        outBuffer.append("\\paragraph{");
      }
      if (elem === "li") {
        outBuffer.append("\\item ");
      }
      if (elem === "ol") {
        outBuffer.append("\\begin{enumerate}");
      }
      if (elem === "pre") {
        outBuffer.append("\\begin{lstlisting}\n");
      }
      if (elem === "strong") {
        outBuffer.append("{\\bf ");
      }
      if (elem === "ul") {
        outBuffer.append("\\begin{itemize}");
      }
      if (elem === "style") {
        noPrintStack.push(elem);
      }
      return state.push(elem);
    });
    cb.onEndElementNS(function(elem, prefix, uri) {
      var i;
      state.pop();
      if (DEBUG) {
        require("sys").debug(((function() {
          var _ref, _results;
          _results = [];
          for (i = 1, _ref = state.length; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
            _results.push("<<");
          }
          return _results;
        })()).join("") + elem.toUpperCase());
      }
      if (elem === "a") {
        outBuffer.append("}");
      }
      if (elem === "code" && state[state.length - 1] !== "pre") {
        outBuffer.append("}");
      }
      if (elem === "em") {
        outBuffer.append("}");
      }
      if (elem === "h1") {
        outBuffer.append("}");
      }
      if (elem === "h2") {
        outBuffer.append("}");
      }
      if (elem === "h3") {
        outBuffer.append("}");
      }
      if (elem === "h4") {
        outBuffer.append("}");
      }
      if (elem === "h5") {
        outBuffer.append("}");
      }
      if (elem === "h6") {
        outBuffer.append("}");
      }
      if (elem === "ol") {
        outBuffer.append("\\end{enumerate}");
      }
      if (elem === "p") {
        outBuffer.append("\n");
      }
      if (elem === "pre") {
        outBuffer.append("\\end{lstlisting}");
      }
      if (elem === "strong") {
        outBuffer.append("}");
      }
      if (elem === "ul") {
        outBuffer.append("\\end{itemize}");
      }
      if (elem === "style") {
        return noPrintStack.pop();
      }
    });
    cb.onCdata(function(cdata) {
      return outBuffer.append(cdata);
    });
    cb.onCharacters(function(chars) {
      if (noPrintStack.length === 0) {
        return outBuffer.append(chars);
      }
    });
    return null;
  });
  return parser.parseString(input);
};
sanitizeLatex = function(s) {
  s = s.replace(/^\s+$/mg, "\n");
  s = s.replace(/(^\n$)+/mg, "");
  s = s.replace(/([^\n])(\\end)/g, "$1\n$2");
  return s;
};
adjustSpecialChars = function(s) {
  s = s.replace(/#/mg, "\\#");
  return s;
};
/* run */
exports.run = function() {
  var options, outfile, postProcess, preProcess, read, readStdin, sanitize, wrap, write;
  outfile = void 0;
  wrap = false;
  readStdin = true;
  sanitize = true;
  options = [
    {
      short: "i",
      long: "infile",
      value: true,
      callback: function(value) {
        readStdin = false;
        return inBuffer.append(fs.readFileSync(value, 'utf8'));
      }
    }, {
      short: "d",
      long: "debug",
      callback: function() {
        return DEBUG = true;
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
      description: 'wrap latex setup arround',
      callback: function() {
        return wrap = true;
      }
    }, {
      long: 'supressSanitization',
      description: 'the xhtml2latex tries to reduce noise and sanitize the resulting latex by default; supress this',
      callback: function() {
        return sanitize = false;
      }
    }
  ];
  helpers.argparser.parse({
    options: options,
    help: true
  });
  preProcess = function(cont) {
    if (wrap) {
      return fs.readFile(lib + "latex/head.tex", 'utf8', function(err, data) {
        outBuffer.append(data);
        return cont();
      });
    } else {
      return cont();
    }
  };
  postProcess = function(cont) {
    if (wrap) {
      return fs.readFile(lib + "latex/tail.tex", 'utf8', function(err, data) {
        outBuffer.append(data);
        return cont();
      });
    } else {
      return cont();
    }
  };
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
  write = function(cont) {
    var s;
    s = sanitize ? sanitizeLatex(outBuffer.toString()) : outBuffer.toString();
    s = adjustSpecialChars(s);
    if (!(outfile != null)) {
      process.stdout.write(s);
      return cont();
    } else {
      return fs.writeFile(outfile, s, 'utf8', function(err) {
        return cont();
      });
    }
  };
  return preProcess(function() {
    return read(function() {
      return parseString(inBuffer.toString(), function() {
        return postProcess(function() {
          return write(function() {});
        });
      });
    });
  });
};