// routes/api/user.js

const express = require('express');
const router = new express.Router();

// List all users
router.get('/', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;

  userController.listUsers(userSchema, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Get specific user
router.get('/:ident', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const userIdent = req.params.ident;

  userController.getUser(userSchema, userIdent, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Create new user
router.post('/', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const properties = req.body;

  userController.createUser(userSchema, properties, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Update an existing user
router.put('/:ident', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const userIdent = req.params.ident;
  const properties = req.body;

  userController.updateUser(
      userSchema,
      userIdent,
      properties,
      function(status, body) {
        res.status(status);
        res.json(body);
      });
});

// Login
router.post('/login', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const creds = req.body;

  userController.authenticate(userSchema, creds, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Delete user
router.delete('/:ident', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const groupController = req.groupController;
  const groupSchema = req.groupSchema;
  const userIdent = req.params.ident;

  userController.deleteUser(
      userSchema,
      groupSchema,
      groupController,
      userIdent,
      function(status, body) {
        res.status(status);
        res.json(body);
      });
});

module.exports = router;
