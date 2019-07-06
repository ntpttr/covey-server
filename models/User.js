/* eslint no-invalid-this: 0 */
// server/models/User.js

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9]+$/,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
  games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}],
  image: String,
  hash: String,
  salt: String,
  isVerified: {type: Boolean, default: false},
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {timestamps: true});

UserSchema.plugin(uniqueValidator);

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
    email: this.email,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    token: this.generateJWT(),
  };
};

UserSchema.methods.toProfileJSON = function() {
  return {
    email: this.email,
    username: this.username,
    groups: this.groups,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
  };
};

module.exports = mongoose.model('User', UserSchema);
