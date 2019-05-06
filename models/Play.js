// server/models/Play.js

const mongoose = require('mongoose');

const PlaySchema = new mongoose.Schema({
  game: {type: String, required: true},
  group: {type: String},
  players: {type: [{
    user: {type: String},
    score: {type: Number},
    placement: {type: Number},
    winner: {type: Boolean},
  }]},
});

module.exports = mongoose.model('Play', PlaySchema);
