// server/models/Play.js

const mongoose = require('mongoose');

/**
 * The schema for each player of an individual play of a game.
 */
const PlayerSchema = new mongoose.Schema({
  user: {type: String},
  score: {type: Number},
  placement: {type: Number},
}, {_id: false});

/**
 * The schema for logging game plays.
 */
const PlaySchema = new mongoose.Schema({
  game: {type: String, required: true},
  group: {type: String, required: true},
  players: [PlayerSchema],
});

module.exports = mongoose.model('Play', PlaySchema);
