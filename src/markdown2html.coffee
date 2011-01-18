###

   markdown2html utility

   (c) 2010,  Dr. Thomas Schank

###

exports.run = () ->

  fs = require 'fs'
  md = require("node-markdown").Markdown

  infile = process.argv[2]
  if not infile?
    console.log "infile required"
    process.exit -1
  outfile = infile.replace /\.(md|mkd|markdown)$/i, ".html"
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
        fs.writeFile outfile, html, (err) ->
          if err?
            console.log "failed to write "+outfile
            process.exit -1
          else
            console.log "successfully written "+outfile



  
