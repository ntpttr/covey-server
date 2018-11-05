const express = require('express');
const router = new express.Router();

const groupController = require('../controllers/groupController');

// List all groups
router.get('/', function(req, res) {
  groupController.listGroups(function(getRes) {
    res.json(getRes);
  });
});

// Get specific group
router.get('/:ident', function(req, res) {
  const groupIdent = req.params.ident;
  groupController.getGroup(groupIdent, function(getRes) {
    res.json(getRes);
  });
});

// Create new group
router.post('/', function(req, res) {
  const properties = req.body;
  groupController.createGroup(properties, function(createRes) {
    res.json(createRes);
  });
});

// Update an existing group
router.put('/:ident', function(req, res) {
  const groupIdent = req.params.ident;
  const properties = req.body;
  groupController.updateGroup(groupIdent, properties, function(updateRes) {
    res.json(updateRes);
  });
});

// Delete group
router.delete('/:ident', function(req, res) {
  const groupIdent = req.params.ident;
  groupController.deleteGroup(groupIdent, function(deleteRes) {
    res.json(deleteRes);
  });
});

// Add user to group
router.post('/:groupIdent/users', function(req, res) {
  const groupIdent = req.params.groupIdent;
  const userIdent = req.body.user;
  groupController.addUser(groupIdent, userIdent, function(addRes) {
    res.json(addRes);
  });
});

// Remove user from group
router.delete('/:groupIdent/users/:userIdent', function(req, res) {
  const groupIdent = req.params.groupIdent;
  const userIdent = req.params.userIdent;
  groupController.deleteUser(groupIdent, userIdent, function(deleteRes) {
    res.json(deleteRes);
  });
});

// Add game to group
router.post('/:groupIdent/games', function(req, res, next) {
  const groupIdent = req.params.groupIdent;
  const gameIdent = req.body.game;
  groupController.addGame(groupIdent, gameIdent, function(addRes) {
    res.json(addRes);
  });
});

// Remove game from group
router.delete('/:groupIdent/games/:gameIdent', function(req, res) {
  const groupIdent = req.params.groupIdent;
  const gameIdent = req.params.gameIdent;
  groupController.deleteGame(groupIdent, gameIdent, function(deleteRes) {
    res.json(deleteRes);
  });
});

// Update stats in a group
router.post('/:groupIdent/stats', function(req, res) {
  const winners = req.body.winners;
  const players = req.body.players;
  const game = req.body.game;
  groupController.updateStats(winners, players, game, function(updateRes) {
    res.json(updateRes);
  });
});

module.exports = router;
