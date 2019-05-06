// server/models/Group.js

const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {type: String, required: true, index: {unique: true}},
  description: {type: String},
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}],
  plays: [{type: mongoose.Schema.Types.ObjectId, ref: 'Play'}],
});

module.exports = mongoose.model('Group', GroupSchema);
