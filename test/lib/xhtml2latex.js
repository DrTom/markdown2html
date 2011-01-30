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
    "some test": function(test) {
      return test.done();
    }
  };
})());