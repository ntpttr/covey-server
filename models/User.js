/* eslint no-invalid-this: 0 */
// server/models/User.js

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, 'can\'t be blank'],
    match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
    index: true,
  },
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
  games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}],
  image: String,
  hash: String,
  salt: String,
}, {timestamps: true});

UserSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(
      password,
      this.salt,
      10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(
      password,
      this.salt,
      10000,
      512,
      'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    token: this.generateJWT(),
  };
};

UserSchema.methods.toProfileJSON = function() {
  return {
    username: this.username,
    groups: this.groups,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
  };
};

UserSchema.methods.addGroup = function(groupId) {
  if (this.groups.indexOf(groupId) === -1) {
    if (mongoose.Types.ObjectId.isValid(groupId)) {
      this.groups.push(groupId);
    }
  }
  return this.save();
};

UserSchema.methods.deleteGroup = function(groupId) {
  const index = this.groups.indexOf(groupId);
  if (index >= 0) {
    this.groups.splice(index, 1);
  }
  return this.save();
};

UserSchema.methods.getGroups = function() {
  return this.groups;
};

module.exports = mongoose.model('User', UserSchema);
