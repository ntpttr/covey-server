// server/models/Group.js

const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: {type: String, required: true, index: {unique: true}},
  description: {type: String},
  thumbnail: {type: String},
  image: {type: String},
  minPlayers: {type: Number},
  maxPlayers: {type: Number},
  playingTime: {type: Number},
});

const GroupSchema = new mongoose.Schema({
  name: {type: String, required: true, index: {unique: true}},
  description: {type: String},
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  games: [GameSchema],
});

module.exports = mongoose.model('Group', GroupSchema);
