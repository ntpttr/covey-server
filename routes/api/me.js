// routes/api/me.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

/**
 * Get current logged in user profile
 */
router.get('/', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const username = req.payload.username;

  controllers.user.getUserProfile(models, username, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'user': body.user.OwnProfileView(),
      });
    }
  });
});

/**
 * Get current logged in user groups
 */
router.get('/groups', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const username = req.payload.username;

  controllers.user.getUserGroups(models, username, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'groups': body.groups,
      });
    }
  });
});

/**
 * Update an existing user
 */
router.patch('/', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const properties = req.body;
  const username = req.payload.username;

  controllers.user.updateUser(
      models,
      username,
      properties,
      function(status, body) {
        if (status != 200) {
          res.status(status).json(body);
        } else {
          res.status(status).json({'user': body.user.OwnProfileView()});
        }
      });
});

/**
 * Delete the authorized user
 */
router.delete('/', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const username = req.payload.username;

  controllers.user.deleteUser(
      models,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

module.exports = router;
