// routes/api/user.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

// Login
router.post('/login', function(req, res, next) {
  const userController = req.userController;

  userController.authenticate(req, function(status, body) {
    res.status(status).json(body.user.toAuthJSON());
  });
});

// Get current user
router.get('/', auth.required, function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const payload = req.payload;

  userController.getUser(userSchema, payload.id, function(status, body) {
    if (status != 200) {
      res.status(status).json({});
    } else {
      res.status(status).json({'user': body.user.toProfileJSON()});
    }
  });
});

// Create new user
router.post('/', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const properties = req.body;

  userController.createUser(userSchema, properties, function(status, body) {
    res.status(status).json(body.user.toAuthJSON());
  });
});

// Update an existing user
router.put('/', auth.required, function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const properties = req.body;
  const payload = req.payload;

  userController.updateUser(
      userSchema,
      payload.id,
      properties,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Delete user
router.delete('/', auth.required, function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const payload = req.payload;

  userController.deleteUser(
      userSchema,
      groupSchema,
      groupController,
      payload.id,
      function(status, body) {
        res.status(status).json(body);
      });
});

module.exports = router;
