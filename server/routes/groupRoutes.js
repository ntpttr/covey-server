// server/routes/groupRoutes.js

const express = require('express');
const router = new express.Router();

// List all groups
router.get('/', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;

  groupController.listGroups(groupSchema, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Get specific group
router.get('/:ident', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const groupIdent = req.params.ident;

  groupController.getGroup(groupSchema, groupIdent, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Create new group
router.post('/', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const properties = req.body;

  groupController.createGroup(groupSchema, properties, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Update an existing group
router.put('/:ident', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const groupIdent = req.params.ident;
  const properties = req.body;

  groupController.updateGroup(
      groupSchema,
      groupIdent,
      properties,
      function(status, body) {
        res.status(status);
        res.json(body);
      });
});

// Delete group
router.delete('/:ident', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const userController = req.userController;
  const userSchema = req.userSchema;
  const groupIdent = req.params.ident;

  groupController.deleteGroup(
      groupSchema,
      userSchema,
      userController,
      groupIdent,
      function(status, body) {
        res.status(status);
        res.json(body);
      });
});

// Add user to group
router.post('/:groupIdent/users', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const userController = req.userController;
  const userSchema = req.userSchema;
  const groupIdent = req.params.groupIdent;
  const userIdent = req.body.user;

  groupController.addUser(
      groupSchema,
      userSchema,
      userController,
      groupIdent,
      userIdent,
      function(status, body) {
        res.status(status);
        res.json(body);
      });
});

// Remove user from group
router.delete('/:groupIdent/users/:userIdent', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const userController = req.userController;
  const userSchema = req.userSchema;
  const groupIdent = req.params.groupIdent;
  const userIdent = req.params.userIdent;

  groupController.deleteUser(
      groupSchema,
      userSchema,
      userController,
      groupIdent,
      userIdent,
      function(status, body) {
        res.status(status);
        res.json(body);
      });
});

// Add game to group
router.post('/:groupIdent/games', function(req, res, next) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const gameController = req.gameController;
  const gameSchema = req.gameSchema;
  const groupIdent = req.params.groupIdent;
  const gameIdent = req.body.game;

  groupController.addGame(
      groupSchema,
      gameSchema,
      gameController,
      groupIdent,
      gameIdent,
      function(status, body) {
        res.status(status);
        res.json(body);
      });
});

// Remove game from group
router.delete('/:groupIdent/games/:gameIdent', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const gameController = req.gameController;
  const gameSchema = req.gameSchema;
  const groupIdent = req.params.groupIdent;
  const gameIdent = req.params.gameIdent;

  groupController.deleteGame(
      groupSchema,
      gameSchema,
      gameController,
      groupIdent,
      gameIdent,
      function(status, body) {
        res.status(status);
        res.json(body);
      });
});

// Update stats in a group
router.post('/:groupIdent/stats', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const winners = req.body.winners;
  const players = req.body.players;
  const game = req.body.game;

  groupController.updateStats(
      groupSchema,
      winners,
      players,
      game,
      function(status, body) {
        res.status(status);
        res.json(body);
      });
});

module.exports = router;
