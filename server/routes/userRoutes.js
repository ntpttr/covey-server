const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// List all users
router.get('/', function(req, res) {
    userController.listUsers(function(getRes) {
        res.json(getRes);
    });
});

// Get specific user
router.get('/:ident', function(req, res) {
    var userIdent = req.params.ident;
    userController.getUser(userIdent, function(getRes) {
        res.json(getRes);
    });
});

// Create new user
router.post('/', function(req, res) {
    var properties = req.body;
    userController.createUser(properties, function(createRes) {
        res.json(createRes);
    });
});

// Update an existing user
router.put('/:ident', function(req, res) {
    var userIdent = req.params.ident;
    var properties = req.body;
    userController.updateUser(userIdent, properties, function(updateRes) {
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
    var userIdent = req.params.ident;
    userController.deleteUser(userIdent, function(deleteRes) {
        res.json(deleteRes);
    });
});

module.exports = router;
