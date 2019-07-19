// routes/api/me.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

// Get current logged in user profile
router.get('/', auth.required, function(req, res) {
  const User = req.User;
  const userController = req.userController;
  const username = req.payload.username;

  userController.getUserProfile(User, username, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'user': body.user.OwnProfileView(),
      });
    }
  });
});

// Get current logged in user groups
router.get('/groups', auth.required, function(req, res) {
  const User = req.User;
  const userController = req.userController;
  const username = req.payload.username;

  userController.getUserGroups(User, username, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({
        'groups': body.groups,
      });
    }
  });
});

// Get other user profile
router.get('/profile/:username', function(req, res) {
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
          res.status(status).json({'user': body.user.AuthView()});
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
