const express = require('express');
const path = require('path');
const app = express();
const Handlebars = require('handlebars');
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

app.use(
  "/style",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);

app.use(
  "/style",
  express.static(path.join(__dirname, "node_modules/"))
)

app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);

app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));

app.use("/js", express.static(path.join(__dirname, "node_modules/handlebars/dist")));

app.use('/', appRouter);

module.exports = app;
