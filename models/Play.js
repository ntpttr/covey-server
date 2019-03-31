// server/models/Play.js

const mongoose = require('mongoose');

const PlaySchema = new mongoose.Schema({
  game: {type: mongoose.Schema.Types.ObjectId, ref: 'Game'},
  players: {type: [{
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    placement: {type: Number},
  }]},
});

module.exports = mongoose.model('Play', PlaySchema);
