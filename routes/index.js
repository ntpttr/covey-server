// routes/index.js

const express = require('express');
const router = express.Router();

router.use('/', require('./api'));

router.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      'message': 'Invalid token.',
    });
  }
});

module.exports = router;
