var Fs, Path, Util, bindir, child_process, exec, execEnv, libdir, maindir, testCase, testdir;
Path = require('path');
Fs = require('fs');
Util = require('util');
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
  var clean;
  clean = function(cont) {
    return exec("rm -f " + testdir + "fixture/document.html", execEnv, function(err, stdout, sterr) {
      return cont();
    });
  };
  return {
    setUp: function(callback) {
      return clean(callback);
    },
    "testing the executeable": function(test) {
      var cmd;
      test.expect(3);
      cmd = "" + bindir + "markdown2html -i " + testdir + "/fixture/document.mkd";
      return exec(cmd, execEnv, function(err, stdout, sterr) {
        test.ok(!(err != null), 'error must be null');
        return exec("cat " + testdir + "/fixture/document.html", execEnv, function(err, stdout, sterr) {
          test.ok(stdout.match(/Hello World/), "'Hello World' must be present");
          test.ok(!stdout.match(/DOCTYPE/), "'DOCTYPE' must NOT be present");
          return test.done();
        });
      });
    },
    "testing the --wrap option": function(test) {
      var cmd;
      test.expect(3);
      cmd = "" + bindir + "markdown2html --wrap -i " + testdir + "/fixture/document.mkd";
      return exec(cmd, execEnv, function(err, stdout, sterr) {
        test.ok(!(err != null), 'error must be null');
        return exec("cat " + testdir + "/fixture/document.html", execEnv, function(err, stdout, sterr) {
          test.ok(stdout.match(/Hello World/), "'Hello World' must be present");
          test.ok(stdout.match(/DOCTYPE/), "'DOCTYPE' must be present");
          return test.done();
        });
      });
    },
    "testing the --style option with string": function(test) {
      var cmd;
      test.expect(4);
      cmd = "" + bindir + "markdown2html --style 'h2:{color: blue;}' -i " + testdir + "/fixture/document.mkd";
      return exec(cmd, execEnv, function(err, stdout, sterr) {
        test.ok(!(err != null), 'error must be null');
        return exec("cat " + testdir + "/fixture/document.html", execEnv, function(err, stdout, sterr) {
          test.ok(stdout.match(/Hello World/), "'Hello World' must be present");
          test.ok(stdout.match(/DOCTYPE/), "'DOCTYPE' must be present");
          test.ok(stdout.match(/color: blue/), "'color: blue' must be present");
          return test.done();
        });
      });
    },
    "testing the --style option with a file": function(test) {
      var cmd;
      test.expect(4);
      cmd = "" + bindir + "markdown2html --style " + testdir + "/fixture/h2red.css -i " + testdir + "/fixture/document.mkd";
      return exec(cmd, execEnv, function(err, stdout, sterr) {
        test.ok(!(err != null), 'error must be null');
        return exec("cat " + testdir + "/fixture/document.html", execEnv, function(err, stdout, sterr) {
          test.ok(stdout.match(/Hello World/), "'Hello World' must be present");
          test.ok(stdout.match(/DOCTYPE/), "'DOCTYPE' must be present");
          test.ok(stdout.match(/color: red/), "'color: red' must be present");
          return test.done();
        });
      });
    },
    "testing --styleGithubWikilike": function(test) {
      var cmd;
      test.expect(4);
      cmd = "" + bindir + "markdown2html --styleGithubWikilike -i " + testdir + "/fixture/document.mkd";
      return exec(cmd, execEnv, function(err, stdout, sterr) {
        test.ok(!(err != null), 'error must be null');
        return exec("cat " + testdir + "/fixture/document.html", execEnv, function(err, stdout, sterr) {
          test.ok(stdout.match(/Hello World/), "'Hello World' must be present");
          test.ok(stdout.match(/DOCTYPE/), "'DOCTYPE' must be present");
          test.ok(stdout.match(/\.wikistyle{/), "'wikistyle' must be present");
          return test.done();
        });
      });
    },
    "testing --styleSectionNumbers": function(test) {
      var cmd;
      test.expect(4);
      cmd = "" + bindir + "markdown2html --styleSectionNumbers -i " + testdir + "/fixture/document.mkd";
      return exec(cmd, execEnv, function(err, stdout, sterr) {
        test.ok(!(err != null), 'error must be null');
        return exec("cat " + testdir + "/fixture/document.html", execEnv, function(err, stdout, sterr) {
          test.ok(stdout.match(/Hello World/), "'Hello World' must be present");
          test.ok(stdout.match(/DOCTYPE/), "'DOCTYPE' must be present");
          test.ok(stdout.match(/body{counter-reset: section}/), "'wikistyle' must be present");
          return test.done();
        });
      });
    },
    tearDown: function(callback) {
      return clean(callback);
    }
  };
})());