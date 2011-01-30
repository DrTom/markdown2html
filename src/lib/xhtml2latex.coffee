path = require('path')
fs = require('fs')
main = path.join(path.dirname(fs.realpathSync(__filename)), '../')
lib = main + "lib/"

xml = require("node-xml")
simplecli = require 'simplecli'

println = simplecli.printer.println
print = simplecli.printer.print

inBuffer= simplecli.string.createStringBuffer()
outBuffer = simplecli.string.createStringBuffer()



### parsing ##################################################

parseString = (input,cont) ->

  parser = new xml.SaxParser (cb)  ->

    state = []

    cb.onEndDocument  () ->
      cont()

    getHrefAtt = (attributes) ->
      attributes
        .filter (att) ->
          [key,value]=att
          key is "href"
        .reduce ((prev,att) ->
            [key,value]=att
            return value), ""
        
    cb.onStartElementNS (elem, attrs, prefix, uri, namespaces) ->

      if elem is "a" then outBuffer.append "\\href{" + getHrefAtt(attrs) + "}{"
      if elem is "code" and state[state.length-1] isnt "pre" then outBuffer.append "\\code{"
      if elem is "em" then outBuffer.append "{\\it "
      if elem is "h1" then outBuffer.append "\\section{"
      if elem is "h2" then outBuffer.append "\\subsection{"
      if elem is "h3" then outBuffer.append "\\subsubsection{"
      if elem is "h4" then outBuffer.append "\\paragraph{"
      if elem is "li" then outBuffer.append "\\item "
      if elem is "ol" then outBuffer.append "\\begin{enumerate}"
      if elem is "pre" then outBuffer.append "\\begin{lstlisting}\n"
      if elem is "strong" then outBuffer.append "{\\bf "
      if elem is "ul" then outBuffer.append "\\begin{itemize}"
                       
      # this is subtle: we push state AFTER processing the element ...
      state.push elem

    cb.onEndElementNS (elem, prefix, uri) ->

      # ... however; pop BEFORE processing the element
      # now, we can inspect the enclosing element more easily
      state.pop()
      
      if elem is "a" then outBuffer.append "}"
      if elem is "code" and state[state.length-1] isnt "pre" then outBuffer.append "}"
      if elem is "em" then outBuffer.append "}"
      if elem is "h1" then outBuffer.append "}"
      if elem is "h2" then outBuffer.append "}"
      if elem is "h3" then outBuffer.append "}"
      if elem is "h4" then outBuffer.append "}"
      if elem is "ol" then outBuffer.append "\\end{enumerate}"
      if elem is "p" then outBuffer.append "\n"
      if elem is "pre" then outBuffer.append "\\end{lstlisting}"
      if elem is "strong" then outBuffer.append "}"
      if elem is "ul" then outBuffer.append "\\end{itemize}"

    cb.onCdata  (cdata) ->
      outBuffer.append cdata

    cb.onCharacters (chars)->
      outBuffer.append chars

    null

  parser.parseString input


######

sanitizeLatex = (s) ->

  # remove empty whitespaces in line
  s = s.replace /^\s+$/mg, "\n"

  # remove multiple newlines
  s = s.replace /(^\n$)+/mg, ""

  # \end should always be at first character of a line
  s = s.replace /([^\n])(\\end)/g, "$1\n$2"

  s

### run #######################################################

exports.run = () ->

  outfile = undefined
  wrap = false
  readStdin = true
  sanitize = true

  options = [
      { short: "i"
      , long : "infile"
      , value : true
      , callback : (value) ->
          readStdin = false
          inBuffer.append fs.readFileSync(value,'utf8')
      }
    , { short: "o"
      , long : "outfile"
      , value : true
      , callback : (value) -> outfile = value
      }
    , { short : 'w'
      , long : 'wrap'
      , description : 'wrap latex setup arround'
      , callback : () ->
          wrap=true
      }
    , { long : 'supressSanitization'
      , description : 'the programm tries to reduce noise and sanitize the resulting latex; which can be suppressed'
      , callback : () -> sanitize = false
      }
    ]


  simplecli.argparser.parse
    options: options
    help: true


  preProcess = (cont) ->
    if wrap
      fs.readFile lib + "latex/head.tex", 'utf8', (err,data) ->
        outBuffer.append data
        cont()
    else
      cont()


  postProcess = (cont) ->
    if wrap
      fs.readFile lib + "latex/tail.tex", 'utf8', (err,data) ->
        outBuffer.append data
        cont()
    else
      cont()

  read = (cont) ->
    if readStdin
      stdin = process.openStdin()
      stdin.setEncoding('utf8')
      stdin.on 'data', (chunk) ->
        inBuffer.append chunk
      stdin.on 'end', () ->
        cont()
    else
      cont()

  write = (cont) ->
    s =
      if sanitize
        sanitizeLatex(outBuffer.toString())
      else
        outBuffer.toString()
    if not outfile?
      process.stdout.write s
      cont()
    else
      fs.writeFile outfile,s, 'utf8', (err) ->
        cont()

  # here we go 
  preProcess () ->
    read () ->
      parseString inBuffer.toString(), () ->
        postProcess () ->
          write () ->

