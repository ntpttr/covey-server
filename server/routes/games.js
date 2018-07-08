const express = require('express');
const router = express.Router();

const Game = require('../models/Game');
const gameController = require('../controllers/games');

// List all games in the DB
router.get('/', function(req, res) {
    Game.find({}, function(err, games) {
        if (err) {
            res.json({'status': false,
                      'message': 'Database error finding games!'});
        } else {
            res.json({'status': true,
                      'games': games});
        }
    });
});

// Get specific game from the DB
router.get('/:ident', function(req, res) {
    gameController.getGameDb(req.params.ident, function(getRes) {
        res.json(getRes);
    });
});

// Get specific game from BoardGameGeek's API
router.get('/bgg/:name', function(req, res) {
    gameController.getGameBgg(req.params.name, function(getRes) {
        res.json(getRes);
    });
});

// Save game details to database
router.post('/', function(req, res) {
    var name = req.body.name;

    gameController.getGameBgg(name, function(getRes) {
        if (getRes.status) {
            game = new Game(getRes.game);

            game.save(function(err) {
                if (err) {
                    var errMessage = '';
                    if (err.code === 11000) {
                        // Game already saved in the database
                        errMessage = 'Game already saved!';
                    } else {
                        errMessage = 'Error saving game!';
                    }
                    res.json({'status': false,
                              'message': errMessage});
                    return;
                }
                res.json({'status': true,
                          'game': game});
            });
        } else {
            res.json({'status': false,
                      'message': getRes.message});
        }
    });
});

// Delete game from the DB
router.delete('/:ident', function(req, res) {
    gameController.deleteGame(req.params.ident, function(deleteRes) {
        res.json(deleteRes);
    });
});

module.exports = router;
