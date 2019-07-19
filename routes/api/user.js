// routes/api/user.js

const express = require('express');
const router = new express.Router();

// Login
router.post('/login', function(req, res, next) {
  const userController = req.userController;

  userController.authenticate(req, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'user': body.user.AuthView(),
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
            'user': body.user.AuthView(),
          });
        }
      });
});

// Get user profile
router.get('/:username', function(req, res) {
  const User = req.User;
  const userController = req.userController;
  const username = req.params.username;

  userController.getUserProfile(User, username, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({'user': body.user.OtherProfileView()});
    }
  });
});

module.exports = router;
