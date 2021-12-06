const express = require('express');
const path = require('path');
const app = express();
const { engine } = require('express-handlebars');

const appRouter = require('./routes/index');

app.set('view engine', 'hbs');
app.engine('hbs', engine({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'main',
  partialsDir: __dirname + '/views/partials/'
}));
app.use(express.static('public'));

app.use('/', appRouter);

module.exports = app;
