// server/routes/userRoutes.js

const express = require('express');
const router = new express.Router();

// List all users
router.get('/', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;

  userController.listUsers(userSchema, function(getRes) {
    res.json(getRes);
  });
});

// Get specific user
router.get('/:ident', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const userIdent = req.params.ident;

  userController.getUser(userSchema, userIdent, function(getRes) {
    res.json(getRes);
  });
});

// Create new user
router.post('/', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const properties = req.body;

  userController.createUser(userSchema, properties, function(createRes) {
    res.json(createRes);
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
      function(updateRes) {
        res.json(updateRes);
      });
});

// Login
router.post('/login', function(req, res) {
  const userController = req.userController;
  const userSchema = req.userSchema;
  const creds = req.body;

  userController.authenticate(userSchema, creds, function(auth) {
    res.json(auth);
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
      function(deleteRes) {
        res.json(deleteRes);
      });
});

module.exports = router;
