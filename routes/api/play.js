// routes/api/play.js

const express = require('express');
const router = new express.Router();

// Create new play
router.post('/', function(req, res) {
  const Play = req.Play;
  const playController = req.playController;

  const gameName = req.body.game;
  const groupName = req.body.group;
  const players = req.body.players;

  playController.addPlay(
      Play,
      gameName,
      groupName,
      players,
      function(status, body) {
        res.status(status).json(body);
      });
});

router.get('/:groupName', function(req, res) {
  const Play = req.Play;
  const playController = req.playController;

  const groupName = req.params.groupName;

  playController.getGroupPlays(Play, groupName, function(status, body) {
    res.status(status).json(body);
  });
});

router.delete('/:playId', function(req, res) {
  const Play = req.Play;
  const playController = req.playController;

  const playId = req.params.playId;

  playController.deletePlay(Play, playId, function(status, body) {
    res.status(status).json(body);
  });
});

module.exports = router;
