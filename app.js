const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const httpPort = 80;
const httpsPort = 443;

const app = express();
const version = process.env.npm_package_version;
const appTitle = 'ManyTwitch - Watch multiple Twitch streams at once';
let streamsFromParms = [];

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

app.get('/*', function(req, res) {
  streamsFromParms = req.params['0'].split('/').filter(String);
  res.render('index', {
    version: version,
    appTitle: appTitle,
    streamsFromParms: streamsFromParms
  });
});

module.exports = app;
