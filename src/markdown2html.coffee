###

   markdown2html utility

   (c) 2011,  Dr. Thomas Schank

###

child_process = require 'child_process'
exec = child_process.exec
path = require('path')
fs = require('fs')
main = path.join(path.dirname(fs.realpathSync(__filename)), '../')
lib = main + "lib/"
vendorlib = main + "vendor/lib/"

exports.run = () ->

  simplecli = require 'simplecli'
  node_markdown = require("node-markdown").Markdown
  #  showdown = require vendorlib + "showdown"

  markdown = require lib + "markdown"

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


  script = (() ->
    s = ""
    include:(link,script) ->
      s+="\n<script" + (if link? then (" src='" + link + "'") else "")  + ">\n"
      s+= script if script?
      s+="</script>\n"
    script: () -> s
  )()


  enableTexMath = (pathToMathJax) ->
    script.include pathToMathJax, '''MathJax.Hub.Config({
    extensions: ["tex2jax.js"],
    jax: ["input/TeX","output/HTML-CSS"],
    tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}
  });\n
'''

  filecontentOrValue = (value) ->
    # the use of Sync is intented in this case;
    # we need to maintain the order of files which is a bit of a hassle to do otherwise
    try
      r = fs.readFileSync value, 'utf8'
    catch error
      r = value


  headAppend = ""
  tailPrepend = ""

  head = () -> '<!DOCTYPE HTML>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title> ' + title + ' </title> ' + css.css() + '\n'+ script.script()+'\n</head>\n\n<body>\n\n' + headAppend
  tail= () -> tailPrepend + "\n</body>\n</html>"


  wrapInWikistyle= () ->
    headAppend += "\n<div class='wikistyle'>\n"
    tailPrepend = "\n</div>\n" + tailPrepend

  options = [
      { short: "i"
      , long : "infile"
      , value : true
      , callback : (value) -> infile = value
      }
    , { short: "o"
      , long : "outfile"
      , value : true
      , callback : (value) -> outfile = value
      }
    , { short : 'w'
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
    , { long: "enableTexMath"
      , description: "enable mathematical notation in inline (la)tex style, requires path specification to MathJax.js"
      , value: true
      , callback: (value) ->
          wrap=true
          enableTexMath(value)
      }
    , { long: "styleGithubWikilike"
      , callback: () ->
          wrap=true
          wrapInWikistyle()
          css.include(filecontentOrValue(lib+"styles/githubWikilike.css"))
      }
    , { long: "styleSectionNumbers"
      , callback: () ->
          wrap=true
          css.include(filecontentOrValue(lib+"styles/sectionNumbers.css"))
      }
    ]

  simplecli.argparser.parse
    options: options
    help: true

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
      html = markdown.makeHtml data
      if not html?
        console.log "failed to convert to html"
        process.exit -1
      else
        html = head()+html+tail() if wrap
        fs.writeFile outfile, html, (err) ->
          if err?
            console.log "failed to write "+outfile
            process.exit -1
          else
            console.log "successfully written "+outfile



  
