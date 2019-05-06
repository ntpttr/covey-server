// routes/api/user.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

// Login
router.post('/login', function(req, res, next) {
  const userController = req.userController;

  userController.authenticate(req, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'user': body.user.toAuthJSON(),
      });
    }
  });
});

// Create new user
router.post('/', function(req, res) {
  const User = req.User;
  const userController = req.userController;

  const properties = req.body;

  userController.createUser(User, properties, function(status, body) {
    if (status != 201) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'user': body.user.toAuthJSON(),
      });
    }
  });
});

// Get current logged in user
router.get('/', auth.required, function(req, res) {
  const User = req.User;
  const userController = req.userController;

  const payload = req.payload;

  userController.getUser(User, payload.username, function(status, body) {
    if (status != 200) {
      res.status(status).json({});
    } else {
      res.status(status).json({'user': body.user.toProfileJSON()});
    }
  });
});

// Get specific user
router.get('/:username', function(req, res) {
  const User = req.User;
  const userController = req.userController;

  const username = req.params.username;

  userController.getUser(User, username, function(status, body) {
    if (status != 200) {
      res.status(status).json({});
    } else {
      res.status(status).json({'user': body.user.toProfileJSON()});
    }
  });
});

// Update an existing user
router.put('/', auth.required, function(req, res) {
  const User = req.User;
  const userController = req.userController;

  const properties = req.body;
  const username = req.payload.username;

  userController.updateUser(
      User,
      username,
      properties,
      function(status, body) {
        res.status(status).json({'user': body.user.toProfileJSON()});
      });
});

// Delete user
router.delete('/', auth.required, function(req, res) {
  const User = req.User;
  const Group = req.Group;
  const userController = req.userController;

  const username = req.payload.username;

  userController.deleteUser(
      User,
      Group,
      username,
      function(status, body) {
        res.status(status).json(body);
      });
});

module.exports = router;
