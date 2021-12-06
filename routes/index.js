const express = require('express');
const router = express.Router();
const version = process.env.npm_package_version

router.get('/', function(req, res) {
  res.render('index', {
    version: version
  });
});

module.exports = router;
