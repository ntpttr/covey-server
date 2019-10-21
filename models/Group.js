// server/models/Group.js

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {type: String},
  thumbnail: {type: String},
  image: {type: String},
  minPlayers: {type: Number},
  maxPlayers: {type: Number},
  playingTime: {type: Number},
});

const MemberSchema = new mongoose.Schema({
  username: {type: String},
  link: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {_id: false});

const GroupSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true,
    unique: true,
    uniqueCaseInsensitive: true,
    match: /^[a-zA-Z0-9]+$/,
  },
  displayName: {type: String},
  description: {type: String},
  members: [MemberSchema],
  games: [GameSchema],
});

GroupSchema.plugin(uniqueValidator);

GroupSchema.methods.MinimalView = function() {
  return {
    displayName: this.displayName,
    description: this.description,
    identifier: this.identifier,
  };
};

GroupSchema.methods.DetailedView = function() {
  return {
    displayName: this.displayName,
    description: this.description,
    identifier: this.identifier,
    games: this.games,
  };
};

module.exports = mongoose.model('Group', GroupSchema);
