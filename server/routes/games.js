const express = require('express');
const router = express.Router();

const Game = require('../models/Game');
const gameController = require('../controllers/games');

// Get specific game
router.get('/:name', function(req, res) {
    gameController.getGameByName(req.params.name, function(getRes) {
        res.json(getRes);
    });
});

module.exports = router;
