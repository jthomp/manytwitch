const express = require('express');
const path = require('path');
const app = express();
const compression = require('compression');
const version = process.env.npm_package_version;
// const buildId = process.env.HEROKU_RELEASE_VERSION || '0';

app.set('view engine', 'ejs');
app.use(compression({ level: 9 }));
app.use(express.static(path.join(__dirname, '/public')));

app.use(
  "/webfonts",
  express.static(path.join(__dirname, "node_modules/@fortawesome/fontawesome-free/webfonts"))
);

app.use(
  "/style",
  express.static(path.join(__dirname, "node_modules/@fortawesome/fontawesome-free/css"))
);

app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);

app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/@fortawesome/fontawesome-free/js"))
);

app.get('/*', function(req, res) {
  let streamsFromParms = [];
  streamsFromParms = req.params['0'].split('/').filter(String);
  res.render('index', {
    version: version,
    streamsFromParms: streamsFromParms
  });
});

module.exports = app;