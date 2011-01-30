###

   markdown2html utility

   (c) 2011,  Dr. Thomas Schank

###

child_process = require 'child_process'
util = require 'util'
exec = child_process.exec
path = require('path')
fs = require('fs')
main = path.join(path.dirname(fs.realpathSync(__filename)), '../')
lib = main + "lib/"
vendorlib = main + "vendor/lib/"

simplecli = require 'simplecli'
markdown = require lib + "markdown"

inBuffer= simplecli.string.createStringBuffer()
readStdin = true
outfile = undefined

exports.run = () ->

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

  head = () -> '<!DOCTYPE HTML>\n<html>\n<head>\n  <meta charset="utf-8"/>\n  <title> ' + title + ' </title> ' + css.css() + '\n'+ script.script()+'\n</head>\n\n<body>\n\n' + headAppend
  tail= () -> tailPrepend + "\n</body>\n</html>"


  wrapInWikistyle= () ->
    headAppend += "\n<div class='wikistyle'>\n"
    tailPrepend = "\n</div>\n" + tailPrepend

  options = [
      { short: "i"
      , long : "infile"
      , description: "input file, can be repeated multiple times"
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
      , description : 'wraps con,tent in <html><body> and so forth'
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


  # TODO not DRY, should be in simplecli
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

  # TODO not DRY, should be in simplecli
  write = (html,cont) ->
    if not outfile?
      process.stdout.write html
      cont()
    else
      fs.writeFile outfile,html, 'utf8', (err) ->
        cont()

  read (err) ->
    html = markdown.makeHtml inBuffer.toString()
    html = head()+html+tail() if wrap
    write html, (err)->
  
