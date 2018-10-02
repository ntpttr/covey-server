const express = require('express');
const router = express.Router();

const gameController = require('../controllers/games');

// List all games in the DB
router.get('/', function(req, res) {
    gameController.getGamesDb(function(getRes) {
        res.json(getRes);
    });
});

// Get specific game from the DB
router.get('/:ident', function(req, res) {
    var ident = req.params.ident;
    gameController.getGameDb(ident, function(getRes) {
        res.json(getRes);
    });
});

// Get specific game from BoardGameGeek's API
router.get('/bgg/:name', function(req, res) {
    var name = req.params.name;
    gameController.getGameBgg(name, function(getRes) {
        res.json(getRes);
    });
});

// Save custom game details to database
router.post('/', function(req, res) {
    var properties = req.body;
    gameController.saveCustomGame(properties, function(saveRes) {
        res.json(saveRes);
    });
});

// Save bgg game details to database
router.post('/bgg', function(req, res) {
    var name = req.body.name;
    gameController.saveBggGame(name, function(saveRes) {
        res.json(saveRes);
    });
});

// Delete game from the DB
router.delete('/:ident', function(req, res) {
    gameController.deleteGame(req.params.ident, function(deleteRes) {
        res.json(deleteRes);
    });
});

module.exports = router;
