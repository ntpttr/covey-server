/* eslint no-invalid-this: 0 */
// server/models/User.js

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;
const uniqueValidator = require('mongoose-unique-validator');

/**
 * The schema for indidual users.
 */
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
  name: {
    type: String,
    match: /^[a-zA-Z]+$/,
  },
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
  games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}],
  image: String,
  hash: String,
  salt: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {timestamps: true});
UserSchema.plugin(uniqueValidator);

/**
 * Checks that the provided password matches the one stored for the user.
 * @param {string} password - The password to check against the user.
 * @returns {boolean} True if the password matches, false otherwise.
 */
UserSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(
      password,
      this.salt,
      10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

/**
 * Sets the user password
 * @param {string} - THe password to set.
 */
UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(
      password,
      this.salt,
      10000,
      512,
      'sha512').toString('hex');
};

/**
 * Generates a new JWT token for the user.
 * @returns {string} The JWT string.
 */
UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 14);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

/**
 * The view returned when requesting user auth,
 * including the username and a new JWT token.
 */
UserSchema.methods.AuthView = function() {
  return {
    username: this.username,
    token: this.generateJWT(),
  };
};

/**
 * The view of a user looking at their own profile.
 */
UserSchema.methods.OwnProfileView = function() {
  return {
    username: this.username,
    email: this.email,
    name: this.name,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
  };
};

/**
 * The more restricted view of a user viewing another user's profile.
 */
UserSchema.methods.ProfileView = function() {
  return {
    username: this.username,
    name: this.name,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
  };
};

module.exports = mongoose.model('User', UserSchema);
