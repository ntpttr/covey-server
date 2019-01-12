// server/routes/gameRoutes.js

const express = require('express');
const router = new express.Router();

// List all games in the DB
router.get('/', function(req, res) {
  const gameSchema = req.gameSchema;
  const gameController = req.gameController;

  gameController.listGamesDb(gameSchema, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Get specific game from the DB
router.get('/:ident', function(req, res) {
  const gameSchema = req.gameSchema;
  const gameController = req.gameController;
  const ident = req.params.ident;

  gameController.getGameDb(gameSchema, ident, function(status, body) {
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

// Save custom game details to database
router.post('/', function(req, res) {
  const gameSchema = req.gameSchema;
  const gameController = req.gameController;
  const properties = req.body;

  gameController.saveCustomGame(gameSchema, properties, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Save bgg game details to database
router.post('/bgg', function(req, res) {
  const gameSchema = req.gameSchema;
  const gameController = req.gameController;
  const name = req.body.name;

  gameController.saveBggGame(gameSchema, name, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

// Delete game from the DB
router.delete('/:ident', function(req, res) {
  const gameSchema = req.gameSchema;
  const gameController = req.gameController;
  const ident = req.params.ident;

  gameController.deleteGame(gameSchema, ident, function(status, body) {
    res.status(status);
    res.json(body);
  });
});

module.exports = router;
