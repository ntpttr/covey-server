const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');

// List all groups
router.get('/', function(req, res) {
    groupController.getGroups(function(getRes) {
        res.json(getRes);
    });
});

// Get specific group
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
router.post('/:groupIdent/users', function (req, res) {
    var groupIdent = req.params.groupIdent;
    var userIdent = req.body.user;
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
router.post('/:groupIdent/games', function (req, res, next) {
    var groupIdent = req.params.groupIdent;
    var gameIdent = req.body.game;
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

// Update stats in a group
router.post('/:groupIdent/stats', function(req, res) {
    var winners = req.body.winners;
    var players = req.body.players;
    var game = req.body.game;
    groupController.updateStats(winners, players, game, function(updateRes) {
        res.json(updateRes);
    });
});

module.exports = router;
