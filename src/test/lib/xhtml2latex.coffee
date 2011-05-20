Path = require 'path'
Fs = require 'fs'

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

  "xhtml2latex binary works and simple content": (test)->

    cmd = "#{bindir}markdown2html -i #{testdir}/fixture/document.mkd -w | #{bindir}xhtml2latex  "
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
      test.ok (stdout.match /\\section\{This is a H1 Header.*\}/), " This is a H1 Header must be warpped in a section header"
      test.ok not (stdout.match /\\documentclass/), " 'documentclass' must not be present"
      test.done()

  "using the --wrap option": (test)->

    cmd = "#{bindir}markdown2html -i #{testdir}/fixture/document.mkd -w | #{bindir}xhtml2latex -w "
    exec cmd , execEnv,(err,stdout,sterr) ->
      test.ok (not err?),'error must be null'
      test.ok (stdout.match /This is a H1 Header/), "'This is a H1 Header' must be present"
      test.ok (stdout.match /\\section\{This is a H1 Header.*\}/), " This is a H1 Header must be warpped in a section header"
      test.ok (stdout.match /\\documentclass/), " 'documentclass' must not be present"
      test.done()


)())
