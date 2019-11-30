// routes/api/group.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

/**
 * Create a new group
 */
router.post('/', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const creator = req.payload.username;
  const properties = req.body;

  controllers.group.createGroup(models, controllers, creator, properties, function(status, body) {
    if (status != 201) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'group': body.group.MinimalView(),
      });
    }
  });
});

/**
 * Get specific group that the user is authorized to view
 */
router.get('/:identifier', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;

  controllers.group.getGroup(models, identifier, actingUser, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'group': body.group.DetailedView(),
        'members': body.members,
      });
    }
  });
});

/**
 * Update an existing group
 */
router.patch('/:identifier', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const properties = req.body;

  controllers.group.updateGroup(
      models,
      identifier,
      actingUser,
      properties,
      function(status, body) {
        if (status != 200) {
          res.status(status).json(body);
        } else {
          res.status(status).json({
            'group': body.group.MinimalView(),
          });
        }
      });
});

/**
 * Delete a group
 */
router.delete('/:identifier', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;

  controllers.group.deleteGroup(
      models,
      identifier,
      actingUser,
      function(status, body) {
        res.status(status).json(body);
      });
});

/**
 * Add a new member to a group
 */
router.post('/:identifier/members', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const username = req.body.username;

  controllers.group.addMember(
      models,
      controllers,
      identifier,
      actingUser,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

/**
 * Remove a member from a group
 */
router.delete('/:identifier/members', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const username = req.body.username;

  controllers.group.removeMember(
      models,
      controllers,
      identifier,
      actingUser,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

/**
 * Add a game to a group
 */
router.post('/:identifier/games', auth.required, function(req, res, next) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const gameProperties = req.body;

  controllers.group.addGame(
      models,
      identifier,
      actingUser,
      gameProperties,
      function(status, body) {
        res.status(status).json(body);
      });
});

/**
 * Remove a game from a group
 */
router.delete('/:identifier/games', auth.required, function(req, res) {
  const models = req.models;
  const controllers = req.controllers;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const gameName = req.body.game;

  controllers.group.deleteGame(
      models,
      identifier,
      actingUser,
      gameName,
      function(status, body) {
        res.status(status).json(body);
      });
});

module.exports = router;
