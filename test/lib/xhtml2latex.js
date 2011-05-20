var Fs, Path, bindir, child_process, exec, execEnv, libdir, maindir, testCase, testdir;
Path = require('path');
Fs = require('fs');
child_process = require('child_process');
testCase = require('nodeunit').testCase;
maindir = Path.join(Path.dirname(Fs.realpathSync(__filename)), '../../');
libdir = maindir + "lib/";
testdir = maindir + "test/";
bindir = maindir + "bin/";
exec = child_process.exec;
execEnv = {
  encoding: 'utf8',
  timeout: 0,
  maxBuffer: 200 * 1024,
  killSignal: 'SIGTERM',
  cwd: maindir,
  env: null
};
module.exports = testCase((function() {
  return {
    "xhtml2latex binary works and simple content": function(test) {
      var cmd;
      cmd = "" + bindir + "markdown2html -i " + testdir + "/fixture/document.mkd -w | " + bindir + "xhtml2latex  ";
      return exec(cmd, execEnv, function(err, stdout, sterr) {
        test.ok(!(err != null), 'error must be null');
        test.ok(stdout.match(/This is a H1 Header/), "'This is a H1 Header' must be present");
        test.ok(stdout.match(/\\section\{This is a H1 Header.*\}/), " This is a H1 Header must be warpped in a section header");
        test.ok(!(stdout.match(/\\documentclass/)), " 'documentclass' must not be present");
        return test.done();
      });
    },
    "using the --wrap option": function(test) {
      var cmd;
      cmd = "" + bindir + "markdown2html -i " + testdir + "/fixture/document.mkd -w | " + bindir + "xhtml2latex -w ";
      return exec(cmd, execEnv, function(err, stdout, sterr) {
        test.ok(!(err != null), 'error must be null');
        test.ok(stdout.match(/This is a H1 Header/), "'This is a H1 Header' must be present");
        test.ok(stdout.match(/\\section\{This is a H1 Header.*\}/), " This is a H1 Header must be warpped in a section header");
        test.ok(stdout.match(/\\documentclass/), " 'documentclass' must not be present");
        return test.done();
      });
    }
  };
})());