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

// Confirm user account
router.get('/confirm/:token', function(req, res) {
  const User = req.User;
  const ValidationKey = req.ValidationKey;
  const userController = req.userController;
  const token = req.params.token;

  userController.confirmUser(
      User, ValidationKey, token, function(status, body) {
        res.status(status).json(body);
      });
});

// Resend a user confirmation email
router.post('/resend/:username', function(req, res) {
  const User = req.User;
  const ValidationKey = req.ValidationKey;
  const userController = req.userController;
  const username = req.params.username;
  const host = req.headers.host;

  userController.resendConfirmation(
      User, ValidationKey, username, host, function(status, body) {
        res.status(status).json(body);
      });
});

// Create new user
router.post('/', function(req, res) {
  const User = req.User;
  const ValidationKey = req.ValidationKey;
  const userController = req.userController;
  const properties = req.body;
  const host = req.headers.host;

  userController.createUser(
      User, ValidationKey, properties, host, function(status, body) {
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
  const username = req.payload.username;

  userController.getUserDetails(User, username, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'user': body.user.toProfileJSON(),
      });
    }
  });
});

// Get specific user
router.get('/:username', function(req, res) {
  const User = req.User;
  const userController = req.userController;
  const username = req.params.username;

  userController.getUserDetails(User, username, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({'user': body.user.toProfileJSON()});
    }
  });
});

// Update an existing user
router.patch('/', auth.required, function(req, res) {
  const User = req.User;
  const userController = req.userController;
  const properties = req.body;
  const username = req.payload.username;

  userController.updateUser(
      User,
      username,
      properties,
      function(status, body) {
        if (status != 200) {
          res.status(status).json(body);
        } else {
          res.status(status).json({'user': body.user.toAuthJSON()});
        }
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
