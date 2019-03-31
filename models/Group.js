// server/models/Group.js

const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {type: String, required: true, index: {unique: true}},
  description: {type: String},
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}],
  plays: [{type: mongoose.Schema.Types.ObjectId, ref: 'Play'}],
});

GroupSchema.methods.findUserIndex = function(userId) {
  let index = -1;
  for (let i = 0; i < this.users.length; i++) {
    if (this.users[i].toString() == userId) {
      index = i;
      break;
    }
  }
  return index;
};

GroupSchema.methods.findGameIndex = function(gameId) {
  let index = -1;
  for (let i = 0; i < this.games.length; i++) {
    if (this.games[i] == gameId) {
      index = i;
    }
  }
  return index;
};

GroupSchema.methods.addUser = function(userId) {
  if (this.findUserIndex(userId) == -1) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      this.users.push(userId);
    }
  }
  return this.save();
};

GroupSchema.methods.deleteUser = function(userId) {
  let userDeleted = false;
  const index = this.findUserIndex(userId);
  if (index >= 0) {
    userDeleted = true;
    this.users.splice(index, 1);
  }
  this.save();
  return userDeleted;
};

GroupSchema.methods.getUsers = function() {
  return this.users;
};

GroupSchema.methods.addGame = function(gameId) {
  if (this.games.indexOf(gameId) === -1) {
    if (mongoose.Types.ObjectId.isValid(gameId)) {
      this.games.push(gameId);
    }
  }
  return this.save();
};

GroupSchema.methods.deleteGame = function(gameId) {
  const index = this.findGameIndex(gameId);
  if (index >= 0) {
    this.games.splice(index, 1);
  }
  return this.save();
};

module.exports = mongoose.model('Group', GroupSchema);
