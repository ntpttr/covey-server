// routes/api/game.js

const express = require('express');
const router = new express.Router();

// Get game by name from BoardGameGeek's API
router.get('/:name', function(req, res) {
  const gameController = req.gameController;
  const name = req.params.name;

  gameController.getGameBgg(name, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Search bgg for a game
router.get('/search/:name', function(req, res) {
  const gameController = req.gameController;
  const name = req.params.name;

  gameController.searchGameBgg(name, function(status, body) {
    res.status(status).json(body);
  });
});

// Save game details to database
router.post('/', function(req, res) {
  const Game = req.Game;
  const gameController = req.gameController;
  const properties = req.body;

  gameController.saveGame(Game, properties, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Search bgg for a game
router.get('/bggSearch/:name', function(req, res) {
  const gameController = req.gameController;
  const name = req.params.name;

  gameController.searchGameBgg(name, function(status, body) {
    res.status(status).json(body);
  });
});

// Delete game from the DB
router.delete('/:name', function(req, res) {
  const Game = req.Game;
  const gameController = req.gameController;
  const name = req.params.name;

  gameController.deleteGame(Game, name, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

module.exports = router;
