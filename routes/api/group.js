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
router.get('/:name', function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;

  const name = req.params.name;

  groupController.getGroup(Group, name, function(status, body) {
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
router.put('/:name', function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;

  const name = req.params.name;
  const properties = req.body;

  groupController.updateGroup(
      Group,
      name,
      properties,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Delete group
router.delete('/:name', function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;

  const name = req.params.name;

  groupController.deleteGroup(
      Group,
      User,
      name,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Add user to group
router.post('/:groupName/users', function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;
  const userController = req.userController;

  const groupName = req.params.groupName;
  const username = req.body.user;

  groupController.addUser(
      Group,
      User,
      userController,
      groupName,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Remove user from group
router.delete('/:groupName/users', function(req, res) {
  const Group = req.Group;
  const User = req.User;
  const groupController = req.groupController;
  const userController = req.userController;

  const groupName = req.params.groupName;
  const username = req.body.user;

  groupController.deleteUser(
      Group,
      User,
      userController,
      groupName,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Add game to group
router.post('/:groupName/games', function(req, res, next) {
  const Group = req.Group;
  const groupController = req.groupController;

  const groupName = req.params.groupName;
  const gameProperties = req.body;

  groupController.addGame(
      Group,
      groupName,
      gameProperties,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Remove game from group
router.delete('/:groupName/games', function(req, res) {
  const Group = req.Group;
  const groupController = req.groupController;

  const groupName = req.params.groupName;
  const gameName = req.body.game;

  groupController.deleteGame(
      Group,
      groupName,
      gameName,
      function(status, body) {
        res.status(status).json(body);
      });
});

module.exports = router;
