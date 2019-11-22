// routes/api/index.js

const express = require('express');
const router = new express.Router();

// Define schema variables
const User = require('../../models/User');
const Group = require('../../models/Group');
const Play = require('../../models/Play');
const ValidationKey = require('../../models/ValidationKey');

// Define controller variables
const userController = require('../../controllers/user');
const groupController = require('../../controllers/group');
const gameController = require('../../controllers/game');
const playController = require('../../controllers/play');

// Add /me routes
router.use('/me', function(req, res, next) {
  req.User = User;
  req.Group = Group;
  req.ValidationKey = ValidationKey;
  req.userController = userController;
  next();
}, require('./me'));

// Add /users routes
router.use('/users', function(req, res, next) {
  req.User = User;
  req.Group = Group;
  req.ValidationKey = ValidationKey;
  req.userController = userController;
  next();
}, require('./user'));

// Add /groups routes
router.use('/groups', function(req, res, next) {
  req.Group = Group;
  req.User = User;
  req.groupController = groupController;
  req.userController = userController;
  req.gameController = gameController;
  next();
}, require('./group'));

// Add /games routes
router.use('/games', function(req, res, next) {
  req.gameController = gameController;
  next();
}, require('./game'));

// Add /plays routes
router.use('/plays', function(req, res, next) {
  req.Play = Play;
  req.Group = Group;
  req.playController = playController;
  req.groupController = groupController;
  next();
}, require('./play'));

module.exports = router;
