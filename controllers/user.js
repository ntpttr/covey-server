// server/controllers/userController.js

const passport = require('passport');

/**
 * Authenticate a user based on credentials.
 * @param {object} creds - The credentials to check.
 * @param {function} callback - The callback function.
 */
function authenticate(creds, callback) {
  if (!creds.body.username) {
    callback(422, {
      'message': 'username is empty',
    });
    return;
  }

  if (!creds.body.password) {
    callback(422, {
      'message': 'password is empty',
    });
    return;
  }

  passport.authenticate('local', {session: false}, function(err, user, info) {
    if (err) {
      callback(500, {
        'message': err,
      });
      return;
    }

    if (user) {
      callback(200, {
        'user': user,
      });
    } else {
      callback(400, info);
    }
  })(creds, callback);
};

/**
 * List users in the database.
 * @param {schema} User - The user mongoose schema.
 * @param {function} callback - The callback function.
 */
function listUsers(User, callback) {
  User.find({}, function(err, users) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else {
      callback(200, {
        'users': users,
      });
    }
  });
}

/**
 * Get a user based on its name.
 * @param {schema} User - The user mongoose schema.
 * @param {string} username - The username.
 * @param {function} callback - The callback function.
 */
function getUser(User, username, callback) {
  User.findOne({username: username}, function(err, user) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (user) {
      callback(200, {
        'user': user,
      });
    } else {
      callback(404, {
        'message': 'user not found',
      });
    }
  });
}

/**
 * Create a new user.
 * @param {schema} User - The user mongoose schema.
 * @param {object} properties - The user properties.
 * @param {function} callback - The callback function.
 */
function createUser(User, properties, callback) {
  user = new User();

  user.username = properties.username;
  user.setPassword(properties.password);

  user.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        // Duplicate username found
        callback(409, {
          'message': 'username already exists',
        });
        return;
      } else {
        callback(500, {
          'message': err,
        });
        return;
      }
    }
    callback(201, {
      'user': user,
    });
  });
}

/**
 * Update an existing user.
 * @param {schema} User - The user mongoose schema.
 * @param {string} ident - The user identifier, either name or ID.
 * @param {object} properties - The properties for the user.
 * @param {function} callback - The callback function.
 */
function updateUser(User, ident, properties, callback) {
  getUser(User, ident, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }
    user = body.user;
    Object.assign(user, properties).save((err, user) => {
      if (err) {
        callback(500, {
          'message': err,
        });
      } else {
        callback(200, {
          'user': user,
        });
      }
    });
  });
}

/**
 * Add a reference to a group
 * @param {schema} User - The user mongoose schema
 * @param {string} username - The username.
 * @param {string} groupId - The group mongoose Id.
 * @param {function} callback - The callback function.
 */
function addGroupLink(User, username, groupId, callback) {
  User.findOneAndUpdate({
    username: username,
  }, {
    $addToSet: {
      groups: groupId,
    },
  }, {
    new: true,
  }).exec(function(err, user) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else {
      callback(200, {
        'user': user,
      });
    }
  });
}

/**
 * Remove a reference to a group
 * @param {schema} User - The user mongoose schema
 * @param {string} username - The username.
 * @param {string} groupId - The group mongoose Id.
 * @param {function} callback - The callback function.
 */
function removeGroupLink(User, username, groupId, callback) {
  User.findOneAndUpdate({
    username: username,
  }, {
    $pull: {
      groups: groupId,
    },
  }, {
    new: true,
  }).exec(function(err, user) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else {
      callback(200, {
        'user': user,
      });
    }
  });
}

/**
 * Delete a user.
 * @param {schema} User - The user mongoose schema.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} username - The username.
 * @param {function} callback - The callback function.
 */
function deleteUser(User, Group, username, callback) {
  // First delete this group from all user lists.
  User.findOne({
    username: username,
  }).populate('groups').exec(function(err, user) {
    user.groups.forEach(function(group) {
      Group.update({
        _id: group._id,
      }, {
        $pull: {
          users: user._id,
        },
      }).exec(function(err, user) {
        console.log(user.username + ' removed from ' + group.name);
      });
    });

    User.findByIdAndRemove(user._id, function(err, user) {
      if (err) {
        callback(500, {
          'message': err,
        });
      } else if (user) {
        callback(200, {
          'message': 'user deleted successfully',
        });
      } else {
        callback(404, {
          'message': 'user not found',
        });
      }
    });
  });
}

module.exports = {
  authenticate,
  listUsers,
  getUser,
  createUser,
  updateUser,
  addGroupLink,
  removeGroupLink,
  deleteUser,
};
