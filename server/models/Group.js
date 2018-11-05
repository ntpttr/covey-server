// server/models/Group.js

const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  users: {type: [{
    id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: {type: String},
    stats: {type: [{
      game: {type: mongoose.Schema.Types.ObjectId, ref: 'Game'},
      wins: {type: Number},
      losses: {type: Number},
    }]},
  }]},
  games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}],
});

groupSchema.methods.findUserIndex = function(userIdent) {
  let index = -1;
  for (let i = 0; i < this.users.length; i++) {
    if (this.users[i].id.toString() == userIdent ||
        this.users[i].name == userIdent) {
      index = i;
      break;
    }
  }
  return index;
};

groupSchema.methods.addUser = function(userId, userName) {
  if (this.findUserIndex(userId) == -1) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const stats = [];
      for (let i = 0; i < this.games.length; i++) {
        stats.push({
          game: this.games[i],
          wins: 0,
          losses: 0,
        });
      }
      this.users.push({id: userId, name: userName, stats: stats});
    }
  }
  return this.save();
};

groupSchema.methods.deleteUser = function(userIdent) {
  let userDeleted = false;
  const index = this.findUserIndex(userIdent);
  if (index >= 0) {
    userDeleted = true;
    this.users.splice(index, 1);
  }
  this.save();
  return userDeleted;
};

groupSchema.methods.findGameIndex = function(gameId) {
  let index = -1;
  for (let i = 0; i < this.games.length; i++) {
    if (this.games[i].game == gameId) {
      index = i;
    }
  }
  return index;
};

groupSchema.methods.addGame = function(gameId, name) {
  if (this.games.indexOf(gameId) === -1) {
    if (mongoose.Types.ObjectId.isValid(gameId)) {
      this.games.push({game: gameId});
      for (let i = 0; i < this.users.length; i++) {
        this.users[i].stats.push({
          game: gameId,
          wins: 0,
          losses: 0,
        });
      }
    }
  }
  return this.save();
};

groupSchema.methods.deleteGame = function(gameId) {
  const index = this.findGameIndex(gameId);
  if (index >= 0) {
    this.games.splice(index, 1);
  }
  return this.save();
};

module.exports = mongoose.model('Group', groupSchema);
