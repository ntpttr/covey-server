// routes/api/index.js

const express = require('express');
const router = new express.Router();

const models = require('../../models');
const controllers = require('../../controllers');

// Add /me routes
router.use('/me', function(req, res, next) {
  req.models = models;
  req.controllers = controllers;
  next();
}, require('./me'));

// Add /users routes
router.use('/users', function(req, res, next) {
  req.models = models;
  req.controllers = controllers;
  next();
}, require('./user'));

// Add /groups routes
router.use('/groups', function(req, res, next) {
  req.models = models;
  req.controllers = controllers;
  next();
}, require('./group'));

// Add /games routes
// router.use('/games', function(req, res, next) {
//  req.models = models;
//  req.controllers = controllers;
//  next();
//}, require('./game'));

// Add /plays routes
router.use('/plays', function(req, res, next) {
  req.models = models;
  req.controllers = controllers;
  next();
}, require('./play'));

module.exports = router;
