// routes/api/game.js

const express = require('express');
const router = new express.Router();

// List all games in the DB
router.get('/', function(req, res) {
  const Game = req.Game;
  const gameController = req.gameController;

  gameController.listGames(Game, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Get specific game from the DB
router.get('/:name', function(req, res) {
  const Game = req.Game;
  const gameController = req.gameController;
  const name = req.params.name;

  gameController.getGame(Game, name, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Get specific game from BoardGameGeek's API
router.get('/bgg/:name', function(req, res) {
  const gameController = req.gameController;
  const name = req.params.name;

  gameController.getGameBgg(name, function(status, body) {
    res.status(status);
    res.json(body);
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

// Save bgg game details to database
router.post('/bgg', function(req, res) {
  const Game = req.Game;
  const gameController = req.gameController;
  const name = req.body.name;

  gameController.saveBggGame(Game, name, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Search bgg for a game
router.get('/bgg/search', function(req, res) {
  const gameController = req.gameController;
  const name = req.body.name;

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
