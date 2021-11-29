var express = require('express');
const path = require('path');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')))

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
  res.render('index', {
    version: process.env.npm_package_version
  });
});


module.exports = app;
