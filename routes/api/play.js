// routes/api/play.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

/**
 * Create a new play
 */
router.post('/', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const gameName = req.body.game;
  const groupIdent = req.body.group;
  const players = req.body.players;

  controllers.play.addPlay(
      models,
      controllers,
      actingUser,
      gameName,
      groupIdent,
      players,
      function(status, body) {
        res.status(status).json(body);
      });
});

/**
 * Get all plays for a group
 */
router.get('/:groupIdent', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const groupIdent = req.params.groupIdent;

  controllers.play.getGroupPlays(models, controllers, actingUser, groupIdent, function(status, body) {
    res.status(status).json(body);
  });
});

/**
 * Delete a play
 */
router.delete('/:playId', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const playId = req.params.playId;
  const groupIdent = req.body.group;

  controllers.play.deletePlay(models, controllers, actingUser, groupIdent, playId, function(status, body) {
    res.status(status).json(body);
  });
});

module.exports = router;
