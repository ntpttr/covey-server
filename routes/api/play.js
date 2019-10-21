// routes/api/play.js

const express = require('express');
const auth = require('../auth');
const router = new express.Router();

// Create new play
router.post('/', auth.required, function(req, res) {
  const Play = req.Play;
  const Group = req.Group;
  const playController = req.playController;
  const groupController = req.groupController;

  const actingUser = req.payload.username;
  const gameName = req.body.game;
  const groupIdent = req.body.group;
  const players = req.body.players;

  playController.addPlay(
      Play,
      Group,
      groupController,
      actingUser,
      gameName,
      groupIdent,
      players,
      function(status, body) {
        res.status(status).json(body);
      });
});

// Get all plays for a group
router.get('/:groupIdent', auth.required, function(req, res) {
  const Play = req.Play;
  const Group = req.Group;
  const playController = req.playController;
  const groupController = req.groupController;

  const actingUser = req.payload.username;
  const groupIdent = req.params.groupIdent;

  playController.getGroupPlays(Play, Group, groupController, actingUser, groupIdent, function(status, body) {
    res.status(status).json(body);
  });
});

// Delete a play
router.delete('/:playId', auth.required, function(req, res) {
  const Play = req.Play;
  const Group = req.Group;
  const playController = req.playController;
  const groupController = req.groupController;

  const actingUser = req.payload.username;
  const playId = req.params.playId;
  const groupIdent = req.body.group;

  playController.deletePlay(Play, Group, groupController, actingUser, groupIdent, playId, function(status, body) {
    res.status(status).json(body);
  });
});

module.exports = router;
