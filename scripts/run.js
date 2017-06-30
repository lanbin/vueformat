"use strict";

var path = require("path");
var fs = require("fs");
var csscomb = require('csscomb');
var minify = require("jsonminify");
var js_beautify = require("js-beautify")
  .js_beautify;
var css_beautify = require("js-beautify")
  .css;
var html_beautify = require("js-beautify")
  .html;
var standard = require("standard")

fs.existsSync = fs.existsSync || path.existsSync;
path.sep = path.sep || "/";

var tempPath = process.argv[2] || "";
var filePath = process.argv[3] || "";
var formatType = process.argv[4] || "";
var pluginFolder = path.dirname(__dirname);
var sourceFolder = path.dirname(filePath);
var options = { html: {}, css: {}, js: {} };

function jsFormat(data) {
  data =  data.replace(/\/\/<!--(.*)-->/g, '')
  var result = standard.lintTextSync(data, {
    fix:true
  })
  if(result.errorCount > 0) {
    return "//<!-- Your code has error: " + result.errorCount + "-->\n" + data
  }
  return (result && result.results && result.results[0].output) || data
}

var formatFun = {
  'html': html_beautify,
  'css': css_beautify,
  'js': jsFormat
}

if (!formatType) {
  return
}

var jsbeautifyrcPath;

// Try and get some persistent options from the plugin folder.
if (fs.existsSync(jsbeautifyrcPath = pluginFolder + path.sep + ".jsbeautifyrc")) {
  setOptions(jsbeautifyrcPath, options);
}
var sourceFolderParts = path.resolve(sourceFolder)
  .split(path.sep);

fs.readFile(tempPath, "utf8", function(err, data) {
  if (err) {
    return;
  }
  console.log(formatFun[formatType](data, options[formatType]));
});

function getUserHome() {
  return process.env.HOME || path.join(process.env.HOMEDRIVE, process.env.HOMEPATH) || process.env.USERPROFILE;
}

function parseJSON(file) {
  try {
    return JSON.parse(minify(fs.readFileSync(file, "utf8")));
  } catch (e) {
    console.log("Could not parse JSON at: " + file);
    return {};
  }
}

function setOptions(file, optionsStore) {
  var obj = parseJSON(file);

  for (var key in obj) {
    var value = obj[key];

    // Options are defined as an object for each format, with keys as prefs.
    if (key != "html" && key != "css" && key != "js") {
      continue;
    }
    for (var pref in value) {
      // Special case "true" and "false" pref values as actually booleans.
      // This avoids common accidents in .jsbeautifyrc json files.
      if (value == "true" || value == "false") {
        optionsStore[key][pref] = isTrue(value[pref]);
      } else {
        optionsStore[key][pref] = value[pref];
      }
    }
  }
}

