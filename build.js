#!/usr/bin/env node
/**
 * build.js — Builds the add-in:
 *   1. Assembles src/ into a single docs/index.html (for GitHub Pages hosting)
 *   2. Generates config.json with cache-busting timestamp in the URL
 *
 * Usage:  node build.js <github-username>
 * Output: docs/index.html, docs/images/icon.svg, config.json
 */

'use strict';

var fs = require('fs');
var path = require('path');

var SRC = path.join(__dirname, 'src');
var DIST = path.join(__dirname, 'docs');
var OUT = path.join(__dirname, 'config.json');

var githubUser = process.argv[2] || 'YOUR_GITHUB_USERNAME';
var repoName = 'flexible-data-reporter';
var baseUrl = 'https://' + githubUser + '.github.io/' + repoName;

// Cache-busting: timestamp appended to URL in config.json
var cacheBust = Date.now();

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

// ---- Write docs/ files ----

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);
var imagesDir = path.join(DIST, 'images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');

var svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25477B">' +
  '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z' +
  'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>';

fs.writeFileSync(path.join(imagesDir, 'icon.svg'), svgIcon, 'utf8');

// ---- Build config.json (cache-busted URL) ----

var config = {
  name: 'Data Reporter',
  supportEmail: 'support@example.com',
  version: '1.0.0',
  items: [
    {
      url: baseUrl + '/index.html?v=' + cacheBust,
      path: 'ActivityLink/',
      menuName: {
        en: 'Data Reporter'
      },
      svgIcon: baseUrl + '/images/icon.svg?v=' + cacheBust
    }
  ],
  isSigned: false
};

// ---- Write config.json ----

fs.writeFileSync(OUT, JSON.stringify(config, null, 2), 'utf8');

var htmlSize = Buffer.byteLength(html, 'utf8');
var configSize = fs.statSync(OUT).size;

console.log('Build complete!');
console.log('  docs/index.html: ' + (htmlSize / 1024).toFixed(1) + ' KB');
console.log('  config.json:     ' + (configSize / 1024).toFixed(1) + ' KB');
console.log('  Cache bust:      v=' + cacheBust);
console.log('  Base URL:        ' + baseUrl);
console.log('');
console.log('Next steps:');
console.log('  1. git add + commit + push');
console.log('  2. In MyGeotab: Administration > System Settings > Add-Ins');
console.log('  3. Edit existing add-in, paste new config.json, save');
console.log('  (Each build generates a unique URL so no browser cache issues)');
