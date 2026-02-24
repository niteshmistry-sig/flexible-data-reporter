#!/usr/bin/env node
/**
 * build.js — Packages the src/ directory into a single config.json
 * that can be pasted directly into MyGeotab Administration > Add-Ins.
 *
 * Usage:  node build.js
 * Output: config.json in project root
 */

'use strict';

var fs = require('fs');
var path = require('path');

var SRC = path.join(__dirname, 'src');
var OUT = path.join(__dirname, 'config.json');

// Read source files
function readSrc(relPath) {
  return fs.readFileSync(path.join(SRC, relPath), 'utf8');
}

// ---- Read all source files ----

var css = readSrc('css/style.css');

var jsFiles = [
  'js/dataTypes.js',
  'js/cacheManager.js',
  'js/queryEngine.js',
  'js/tableRenderer.js',
  'js/csvExporter.js',
  'js/chartRenderer.js',
  'js/main.js'
];

var jsContents = {};
jsFiles.forEach(function (f) {
  jsContents[f] = readSrc(f);
});

// ---- Build the HTML with embedded CSS and JS ----

var html = readSrc('index.html');

// Replace CSS placeholder
html = html.replace('/* STYLES_PLACEHOLDER */', css);

// Replace each JS placeholder with actual script content
jsFiles.forEach(function (f) {
  var placeholder = '/* SCRIPT:' + f + ' */';
  html = html.replace(placeholder, jsContents[f]);
});

// ---- Build config.json ----

var config = {
  name: 'Flexible Data Reporter',
  supportEmail: 'support@example.com',
  version: '1.0.0',
  items: [
    {
      url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html),
      path: 'ActivityLink/',
      menuName: {
        en: 'Data Reporter'
      },
      icon: 'data:image/svg+xml;base64,' + Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#005f9e">' +
        '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z' +
        'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>'
      ).toString('base64')
    }
  ],
  isSigned: false
};

// ---- Write config.json ----

fs.writeFileSync(OUT, JSON.stringify(config, null, 2), 'utf8');

var htmlSize = Buffer.byteLength(html, 'utf8');
var configSize = fs.statSync(OUT).size;

console.log('Build complete!');
console.log('  HTML size:   ' + (htmlSize / 1024).toFixed(1) + ' KB');
console.log('  config.json: ' + (configSize / 1024).toFixed(1) + ' KB');
console.log('');
console.log('To install:');
console.log('  1. Log into MyGeotab as Administrator');
console.log('  2. Go to Administration > System Settings > Add-Ins');
console.log('  3. Click "Add", paste the contents of config.json');
console.log('  4. Save and refresh — "Data Reporter" appears under Activity');
