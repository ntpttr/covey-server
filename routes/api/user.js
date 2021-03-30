// routes/api/user.js

const express = require('express');
const router = new express.Router();

/**
 * Login
 */
router.post('/login', function(req, res, next) {
  const controllers = req.controllers;

  controllers.user.authenticate(req, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'user': body.user.AuthView(),
      });
    }
  });
});

/**
 * Create a new user
 */
router.post('/', function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const properties = req.body;
  const host = req.headers.host;

  controllers.user.createUser(
      models, properties, host, function(status, body) {
        if (status != 201) {
          res.status(status).json(body);
        } else {
          res.status(status).json({
            'user': body.user.AuthView(),
          });
        }
      });
});

/**
 * Get a user profile
 */
router.get('/:username', function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const username = req.params.username;

  controllers.user.getUserProfile(models, username, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({'user': body.user.ProfileView()});
    }
  });
});

module.exports = router;
