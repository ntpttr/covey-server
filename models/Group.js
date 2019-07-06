// server/models/Group.js

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  description: {type: String},
  thumbnail: {type: String},
  image: {type: String},
  minPlayers: {type: Number},
  maxPlayers: {type: Number},
  playingTime: {type: Number},
});

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  description: {type: String},
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  games: [GameSchema],
});

GameSchema.plugin(uniqueValidator);
GroupSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Group', GroupSchema);
