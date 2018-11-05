/* eslint no-invalid-this: 0 */

// server/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
  name: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true},
  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
});

userSchema.pre('save', function(next) {
  // only hash the password if it has been modified (or is new)
  if (!dfdoc.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      this.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.methods.addGroup = function(groupId) {
  if (this.groups.indexOf(groupId) === -1) {
    if (mongoose.Types.ObjectId.isValid(groupId)) {
      this.groups.push(groupId);
    }
  }
  return this.save();
};

userSchema.methods.deleteGroup = function(groupId) {
  const index = this.groups.indexOf(groupId);
  if (index >= 0) {
    this.groups.splice(index, 1);
  }
  return this.save();
};

userSchema.methods.getGroups = function() {
  return this.groups;
};

module.exports = mongoose.model('User', userSchema);
