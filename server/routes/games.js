const express = require('express');
const router = express.Router();

const Game = require('../models/Game');
const gameController = require('../controllers/games');

// Get specific game
router.get('/:id', function(req, res) {
    gameController.getGame(req.params.id, function(getRes) {
        res.json(getRes);
    });
});

module.exports = router;
