const express = require('express');
const path = require('path');
const app = express();
const version = process.env.npm_package_version;
const appTitle = 'ManyTwitch - Watch multiple Twitch streams at once';

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res) {
  res.render('index', {
    version: version,
    appTitle: appTitle
  });
});

module.exports = app;
