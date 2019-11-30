// server/models/Group.js

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

/**
 * The schema for games played in a group.
 */
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

/**
 * The schema for group members.
 */
const MemberSchema = new mongoose.Schema({
  username: {type: String},
  link: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {_id: false});

/**
 * The group schema.
 */
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
  owners: [{type: String}],
  members: [MemberSchema],
  games: [GameSchema],
});
GroupSchema.plugin(uniqueValidator);

/**
 * Returns a minimal view of the group, not including sub-schemas.
 */
GroupSchema.methods.MinimalView = function() {
  return {
    displayName: this.displayName,
    description: this.description,
    identifier: this.identifier,
  };
};

/**
 * Returns a more detailed group view that includes games. Members are not
 * included as they point to member database objects and not members themselves.
 */
GroupSchema.methods.DetailedView = function() {
  return {
    displayName: this.displayName,
    description: this.description,
    identifier: this.identifier,
    games: this.games,
  };
};

module.exports = mongoose.model('Group', GroupSchema);
