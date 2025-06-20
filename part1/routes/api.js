var express = require('express');
var router = express.Router();

/* GET API listing. */
router.get('/', function(req, res, next) {
  res.send('Response from API endpoint');
});

module.exports = router;
