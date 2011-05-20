Path = require 'path'
Fs = require 'fs'
Util   = require 'util'

child_process = require 'child_process'
testCase = require('nodeunit').testCase


maindir = Path.join(Path.dirname(Fs.realpathSync(__filename)),'../../')
libdir = maindir + "lib/"
testdir = maindir + "test/"
bindir = maindir + "bin/"



exec = child_process.exec

execEnv =
  encoding: 'utf8'
  timeout: 0
  maxBuffer: 200*1024
  killSignal: 'SIGTERM'
  cwd: maindir
  env: null
 

module.exports = testCase((() ->

  clean = (cont) ->
    exec "rm -f #{testdir}fixture/document.html", execEnv, (err,stdout,sterr) ->
      cont()

  setUp: (callback) ->
    clean(callback)

  "testing the executeable": (test) ->
    test.expect 3
    cmd = "#{bindir}markdown2html -i #{testdir}/fixture/document.mkd -o #{testdir}/fixture/document.html"
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      exec "cat #{testdir}/fixture/document.html" , execEnv,(err,stdout,sterr) ->
        test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
        test.ok (not stdout.match /DOCTYPE/), "'DOCTYPE' must NOT be present"
        test.done()

  "testing writing to stdout": (test) ->
    test.expect 3
    cmd = "#{bindir}markdown2html -i #{testdir}/fixture/document.mkd"
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
      test.ok (not stdout.match /DOCTYPE/), "'DOCTYPE' must NOT be present"
      test.done()

  "testing reading from stdin": (test) ->
    test.expect 3
    cmd = "cat #{testdir}/fixture/document.mkd | #{bindir}markdown2html"
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
      test.ok (not stdout.match /DOCTYPE/), "'DOCTYPE' must NOT be present"
      test.done()

  "testing reading multiple docs with -i ... -i ...": (test) ->
    test.expect 4
    cmd = "#{bindir}markdown2html -i #{testdir}/fixture/document.mkd -i #{testdir}/fixture/document2.mkd"
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
      test.ok (stdout.match /Hello Moon/), "'Hello Moon' must be present"
      test.ok (not stdout.match /DOCTYPE/), "'DOCTYPE' must NOT be present"
      test.done()

  "testing the --wrap option": (test) ->
    test.expect 3
    cmd = "#{bindir}markdown2html --wrap -i #{testdir}/fixture/document.mkd -o #{testdir}/fixture/document.html"
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      exec "cat #{testdir}/fixture/document.html" , execEnv,(err,stdout,sterr) ->
        test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
        test.ok (stdout.match /DOCTYPE/), "'DOCTYPE' must be present"
        test.done()

  "testing the --style option with string": (test) ->
    test.expect 4
    cmd = "#{bindir}markdown2html --style 'h2:{color: blue;}' -i #{testdir}/fixture/document.mkd -o #{testdir}/fixture/document.html"
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      exec "cat #{testdir}/fixture/document.html" , execEnv,(err,stdout,sterr) ->
        test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
        test.ok (stdout.match /DOCTYPE/), "'DOCTYPE' must be present"
        test.ok (stdout.match /color: blue/), "'color: blue' must be present"
        test.done()

  "testing the --style option with a file": (test) ->
    test.expect 4
    cmd = "#{bindir}markdown2html --style #{testdir}/fixture/h2red.css -i #{testdir}/fixture/document.mkd -o #{testdir}/fixture/document.html"
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      exec "cat #{testdir}/fixture/document.html" , execEnv,(err,stdout,sterr) ->
        test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
        test.ok (stdout.match /DOCTYPE/), "'DOCTYPE' must be present"
        test.ok (stdout.match /color: red/), "'color: red' must be present"
        test.done()


  "testing --styleSectionNumbers": (test) ->
    test.expect 4
    cmd = "#{bindir}markdown2html --styleSectionNumbers -i #{testdir}/fixture/document.mkd -o #{testdir}/fixture/document.html"
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      exec "cat #{testdir}/fixture/document.html" , execEnv,(err,stdout,sterr) ->
        test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
        test.ok (stdout.match /DOCTYPE/), "'DOCTYPE' must be present"
        test.ok (stdout.match /body{counter-reset: section}/), "'wikistyle' must be present"
        test.done()

  "testing --styleGithubWikilike": (test) ->
    test.expect 4
    cmd = "#{bindir}markdown2html --styleGithubWikilike -i #{testdir}/fixture/document.mkd -o #{testdir}/fixture/document.html"
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      exec "cat #{testdir}/fixture/document.html" , execEnv,(err,stdout,sterr) ->
        test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
        test.ok (stdout.match /DOCTYPE/), "'DOCTYPE' must be present"
        test.ok (stdout.match /\.wikistyle/), "'wikistyle' must be present"
        test.done()

  tearDown:(callback)->
    clean(callback)
)())
