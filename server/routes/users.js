const express = require('express');
const router = express.Router();

const userController = require('../controllers/users');

// List all users
router.get('/', function(req, res) {
    userController.getUsers(function(getRes) {
        res.json(getRes);
    });
});

// Get specific user
router.get('/:ident', function(req, res) {
    userController.getUser(req.params.ident, function(getRes) {
        res.json(getRes);
    });
});

// Create new user
router.post('/', function(req, res) {
    userController.createUser(req.body, function(createRes) {
        res.json(createRes);
    });
});

// Update an existing user
router.put('/:ident', function(req, res) {
    var userIdent = req.params.ident;
    userController.updateUser(userIdent, req.body, function(updateRes) {
        res.json(updateRes);
    });
});

// Login
router.post('/login', function(req, res) {
    var creds = req.body;
    userController.authenticate(creds, function(auth) {
        res.json(auth);
    });
});

// Delete user
router.delete('/:ident', function(req, res) {
    userController.deleteUser(req.params.ident, function(deleteRes) {
        res.json(deleteRes);
    });
});

module.exports = router;
