const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groups');

// List all groups
router.get('/', function(req, res) {
    groupController.getGroups(function(getRes) {
        res.json(getRes);
    });
});

// Get group by id
router.get('/:ident', function(req, res) {
    var groupIdent = req.params.ident;
    groupController.getGroup(groupIdent, function(getRes) {
        res.json(getRes);
    });
});

// Create new group
router.post('/', function(req, res) {
    var properties = req.body;
    groupController.createGroup(properties, function(createRes) {
        res.json(createRes);
    });
});

// Update an existing group
router.put('/:ident', function(req, res) {
    var groupIdent = req.params.ident;
    var properties = req.body;
    groupController.updateGroup(groupIdent, properties, function(updateRes) {
        res.json(updateRes);
    });
});

// Delete group
router.delete('/:ident', function(req, res) {
    var groupIdent = req.params.ident;
    groupController.deleteGroup(groupIdent, function(deleteRes) {
        res.json(deleteRes);
    });
});

// Add user to group
router.post('/:groupIdent/users/:userIdent', function (req, res) {
    var groupIdent = req.params.groupIdent;
    var userIdent = req.params.userIdent;
    groupController.addUser(groupIdent, userIdent, function(addRes) {
        res.json(addRes);
    });
});

// Remove user from group
router.delete('/:groupIdent/users/:userIdent', function(req, res) {
    var groupIdent = req.params.groupIdent;
    var userIdent = req.params.userIdent;
    groupController.deleteUser(groupIdent, userIdent, function(deleteRes) {
        res.json(deleteRes);
    })
});

// Add game to group
router.post('/:groupIdent/games/:gameIdent', function (req, res, next) {
    var groupIdent = req.params.groupIdent;
    var gameIdent = req.params.gameIdent;
    groupController.addGame(groupIdent, gameIdent, function(addRes) {
        res.json(addRes);
    });
});

// Remove game from group
router.delete('/:groupIdent/games/:gameIdent', function(req, res) {
    var groupIdent = req.params.groupIdent;
    var gameIdent = req.params.gameIdent;
    groupController.deleteGame(groupIdent, gameIdent, function(deleteRes) {
        res.json(deleteRes);
    });
});

module.exports = router;
