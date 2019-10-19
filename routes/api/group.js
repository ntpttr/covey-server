// routes/api/group.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

// Create new group
router.post('/', auth.required, function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;
  const userController = req.userController;
  const creator = req.payload.username;
  const properties = req.body;

  groupController.createGroup(Group, User, creator, userController, properties, function(status, body) {
    if (status != 201) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'group': body.group.MinimalView(),
      });
    }
  });
});

// Get specific group
router.get('/:identifier', auth.required, function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;

  groupController.getGroup(Group, identifier, actingUser, function(status, body) {
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

// Update an existing group
router.patch('/:identifier', auth.required, function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const properties = req.body;

  groupController.updateGroup(
      Group,
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

// Delete group
router.delete('/:identifier', auth.required, function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;

  groupController.deleteGroup(
      Group,
      User,
      identifier,
      actingUser,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Add user to group
router.post('/:identifier/users', auth.required, function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;
  const userController = req.userController;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const username = req.body.username;

  groupController.addUser(
      Group,
      User,
      userController,
      identifier,
      actingUser,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Remove user from group
router.delete('/:identifier/users', auth.required, function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;
  const userController = req.userController;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const username = req.body.username;

  groupController.deleteUser(
      Group,
      User,
      userController,
      identifier,
      actingUser,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Add game to group
router.post('/:identifier/games', auth.required, function(req, res, next) {
  const Group = req.Group;
  const groupController = req.groupController;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const gameProperties = req.body;

  groupController.addGame(
      Group,
      identifier,
      actingUser,
      gameProperties,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Remove game from group
router.delete('/:identifier/games', auth.required, function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;
  const actingUser = req.payload.username;
  const identifier = req.params.identifier;
  const gameName = req.body.game;

  groupController.deleteGame(
      Group,
      identifier,
      actingUser,
      gameName,
      function(status, body) {
        res.status(status).json(body);
      });
});

module.exports = router;
