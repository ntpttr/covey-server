// routes/api/index.js

const express = require('express');
const router = new express.Router();

// Define schema variables
const User = require('../../models/User');
const Group = require('../../models/Group');
const Game = require('../../models/Game');
const Play = require('../../models/Play');

// Define controller variables
const userController = require('../../controllers/user');
const groupController = require('../../controllers/group');
const gameController = require('../../controllers/game');
const playController = require('../../controllers/play');

router.use('/user', function(req, res, next) {
  req.User = User;
  req.Group = Group;
  req.userController = userController;
  next();
}, require('./user'));

router.use('/groups', function(req, res, next) {
  req.Group = Group;
  req.User = User;
  req.Game = Game;
  req.groupController = groupController;
  req.userController = userController;
  req.gameController = gameController;
  next();
}, require('./group'));

router.use('/games', function(req, res, next) {
  req.Game = Game;
  req.gameController = gameController;
  next();
}, require('./game'));

router.use('/plays', function(req, res, next) {
  req.Play = Play;
  req.playController = playController;
  next();
}, require('./play'));

module.exports = router;
