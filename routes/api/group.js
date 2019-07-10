// routes/api/group.js

const express = require('express');
const router = new express.Router();

// List all groups
router.get('/', function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;

  groupController.listGroups(Group, function(status, body) {
    res.status(status).json(body);
  });
});

// Get specific group
router.get('/:identifier', function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;

  const identifier = req.params.identifier;

  groupController.getGroup(Group, identifier, function(status, body) {
    res.status(status).json(body);
  });
});

// Create new group
router.post('/', function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;

  const properties = req.body;

  groupController.createGroup(Group, properties, function(status, body) {
    res.status(status).json(body);
  });
});

// Update an existing group
router.patch('/:identifier', function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;

  const identifier = req.params.identifier;
  const properties = req.body;

  groupController.updateGroup(
      Group,
      identifier,
      properties,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Delete group
router.delete('/:identifier', function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;

  const identifier = req.params.identifier;

  groupController.deleteGroup(
      Group,
      User,
      identifier,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Add user to group
router.post('/:identifier/users', function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;
  const userController = req.userController;

  const identifier = req.params.identifier;
  const username = req.body.username;

  groupController.addUser(
      Group,
      User,
      userController,
      identifier,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Remove user from group
router.delete('/:identifier/users', function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;
  const userController = req.userController;

  const identifier = req.params.identifier;
  const username = req.body.username;

  groupController.deleteUser(
      Group,
      User,
      userController,
      identifier,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Add game to group
router.post('/:identifier/games', function(req, res, next) {
  const Group = req.Group;
  const groupController = req.groupController;

  const identifier = req.params.identifier;
  const gameProperties = req.body;

  groupController.addGame(
      Group,
      identifier,
      gameProperties,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Remove game from group
router.delete('/:identifier/games', function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;

  const identifier = req.params.identifier;
  const gameName = req.body.game;

  groupController.deleteGame(
      Group,
      identifier,
      gameName,
      function(status, body) {
        res.status(status).json(body);
      });
});

module.exports = router;
