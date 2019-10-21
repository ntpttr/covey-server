// server/models/Play.js

const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  user: {type: String},
  score: {type: Number},
  placement: {type: Number},
}, {_id: false});

const PlaySchema = new mongoose.Schema({
  game: {type: String, required: true},
  group: {type: String, required: true},
  players: [PlayerSchema],
});

module.exports = mongoose.model('Play', PlaySchema);
