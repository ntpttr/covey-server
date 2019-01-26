// routes/api/user.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

// List all users
router.get('/', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;

  userController.listUsers(userSchema, function(status, body) {
    res.status(status).json(body);
  });
});

// Get specific user
router.get('/:ident', auth.optional, function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const userIdent = req.params.ident;

  userController.getUser(userSchema, userIdent, function(status, body) {
    if (status != 200) {
      res.status(status).json({});
    } else {
      res.status(status).json({'user': body.user.toProfileJSON()});
    }
  });
});

module.exports = router;