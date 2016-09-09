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

fs.existsSync = fs.existsSync || path.existsSync;
path.sep = path.sep || "/";

var tempPath = process.argv[2] || "";
var filePath = process.argv[3] || "";
var formatType = process.argv[4] || "";
var userFolder = process.argv[5] || "";
var pluginFolder = path.dirname(__dirname);
var sourceFolder = path.dirname(filePath);
var options = { html: {}, css: {}, js: {} };

var formatFun = {
  'html': html_beautify,
  'css': css_beautify,
  'js': js_beautify
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

var pathsToLook = sourceFolderParts.map(function(value, key) {
  return sourceFolderParts.slice(0, key + 1)
    .join(path.sep);
});

// Start with the current directory first, then with the user's home folder, and
// end with the user's personal sublime settings folder.
pathsToLook.reverse();
pathsToLook.push(getUserHome());
pathsToLook.push(userFolder);

pathsToLook.filter(Boolean)
  .some(function(pathToLook) {
    if (fs.existsSync(jsbeautifyrcPath = path.join(pathToLook, ".jsbeautifyrc"))) {
      setOptions(jsbeautifyrcPath, options);
      return true;
    }
  });

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

