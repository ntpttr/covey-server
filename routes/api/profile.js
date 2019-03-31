// routes/api/profile.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

// List all profiles
router.get('/', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;

  userController.listUsers(userSchema, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      for (let i = 0; i < body.users.length; i++) {
        body.users[i] = body.users[i].toProfileJSON();
      }
      res.status(status).json(body);
    }
  });
});

// Get specific profile
router.get('/:ident', auth.optional, function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const userIdent = req.params.ident;

  userController.getUser(userSchema, userIdent, function(status, body) {
    if (status != 200) {
      res.status(status).json(body);
    } else {
      res.status(status).json({'user': body.user.toProfileJSON()});
    }
  });
});

module.exports = router;
