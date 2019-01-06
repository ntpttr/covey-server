// server/routes/groupRoutes.js

const express = require('express');
const router = new express.Router();

// List all groups
router.get('/', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;

  groupController.listGroups(groupSchema, function(getRes) {
    res.json(getRes);
  });
});

// Get specific group
router.get('/:ident', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const groupIdent = req.params.ident;

  groupController.getGroup(groupSchema, groupIdent, function(getRes) {
    res.json(getRes);
  });
});

// Create new group
router.post('/', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const properties = req.body;

  groupController.createGroup(groupSchema, properties, function(createRes) {
    res.json(createRes);
  });
});

// Update an existing group
router.put('/:ident', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const groupIdent = req.params.ident;
  const properties = req.body;

  groupController.updateGroup(groupSchema, groupIdent, properties, function(updateRes) {
    res.json(updateRes);
  });
});

// Delete group
router.delete('/:ident', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const userController = req.userController;
  const userSchema = req.userSchema;
  const groupIdent = req.params.ident;

  groupController.deleteGroup(groupSchema, userSchema, userController, groupIdent, function(deleteRes) {
    res.json(deleteRes);
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

  groupController.addUser(groupSchema, userSchema, userController, groupIdent, userIdent, function(addRes) {
    res.json(addRes);
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

  groupController.deleteUser(groupSchema, userSchema, userController, groupIdent, userIdent, function(deleteRes) {
    res.json(deleteRes);
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

  groupController.addGame(groupSchema, gameSchema, gameController, groupIdent, gameIdent, function(addRes) {
    res.json(addRes);
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

  groupController.deleteGame(groupSchema, gameSchema, gameController, groupIdent, gameIdent, function(deleteRes) {
    res.json(deleteRes);
  });
});

// Update stats in a group
router.post('/:groupIdent/stats', function(req, res) {
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const winners = req.body.winners;
  const players = req.body.players;
  const game = req.body.game;
  
  groupController.updateStats(groupSchema, winners, players, game, function(updateRes) {
    res.json(updateRes);
  });
});

module.exports = router;
