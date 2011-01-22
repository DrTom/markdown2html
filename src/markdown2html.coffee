###

   markdown2html utility

   (c) 2011,  Dr. Thomas Schank

###



exports.run = () ->

  simplecli = require 'simplecli'
  fs = require 'fs'
  md = require("node-markdown").Markdown

  infile = undefined
  outfile = undefined

  wrap = false
  title = ""

  css = (() ->
    s = ""
    include : (cssString) ->
      s += '\n<style type="text/css">\n' + cssString + '\n</style>\n'
    css: () -> s
  )()



  filecontentOrValue = (value) ->
    # the use of Sync is intented in this case;
    # we need to maintain the order of files which is a bit of a hassle to do otherwise
    try
      r = fs.readFileSync value, 'utf8'
    catch error
      r = value


  head = () -> '<!DOCTYPE HTML>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title> ' + title + ' </title> 
' + css.css() + '\n</head>\n\n<body>\n\n'

  tail="\n</body>\n</html>"

  options =
    [ { short : 'w'
      , long : 'wrap'
      , description : 'wraps content in <html><body> and so forth'
      , callback : () ->
          wrap=true
      }
    , { short : 't'
      , long : 'title'
      , description : 'specifies title for header'
      , value : true
      , callback : (value) -> title=value
      }
    , { short: 's'
      , long: 'style'
      , description : 'inlines css-styling, either given as the value or in a file; the path of the file would be given as the value then'
      , value : true
      , callback : (value) ->
          wrap=true
          css.include(filecontentOrValue(value))
      }
    , { short: "i"
      , long : "infile"
      , value : true
      , callback : (value) -> infile = value
      }
    , { short: "o"
      , long : "outfile"
      , value : true
      , callback : (value) -> outfile = value
      }
    ]

  simplecli.argparser.parse
    options: options

  if not infile?
    console.log "infile required"
    process.exit -1

  outfile = outfile || infile.replace /\.(md|mkd|markdown)$/i, ".html"

  if infile is outfile
    console.log "failed determine outfile name"
    process.exit -1

  fs.readFile infile, 'utf8', (err,data) ->
    if err?
      console.log "failed to read: " + infile
      process.exit -1
    else
      html = md data, true
      if not html?
        console.log "failed to convert to html"
        process.exit -1
      else
        html = head()+html+tail if wrap
        fs.writeFile outfile, html, (err) ->
          if err?
            console.log "failed to write "+outfile
            process.exit -1
          else
            console.log "successfully written "+outfile



  
