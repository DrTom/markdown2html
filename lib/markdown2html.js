/*

   markdown2html utility

   (c) 2010,  Dr. Thomas Schank

*/exports.run = function() {
  var fs, infile, md, outfile;
  fs = require('fs');
  md = require("node-markdown").Markdown;
  infile = process.argv[2];
  if (!(infile != null)) {
    console.log("infile required");
    process.exit(-1);
  }
  outfile = infile.replace(/\.(md|mkd|markdown)$/i, ".html");
  if (infile === outfile) {
    console.log("failed determine outfile name");
    process.exit(-1);
  }
  return fs.readFile(infile, 'utf8', function(err, data) {
    var html;
    if (err != null) {
      console.log("failed to read: " + infile);
      return process.exit(-1);
    } else {
      html = md(data, true);
      if (!(html != null)) {
        console.log("failed to convert to html");
        return process.exit(-1);
      } else {
        return fs.writeFile(outfile, html, function(err) {
          if (err != null) {
            console.log("failed to write " + outfile);
            return process.exit(-1);
          } else {
            return console.log("successfully written " + outfile);
          }
        });
      }
    }
  });
};