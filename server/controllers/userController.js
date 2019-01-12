// server/controllers/userController.js

/**
 * Authenticate a user based on credentials.
 * @param {schema} User - The user mongoose schema.
 * @param {object} creds - The credentials to check.
 * @param {function} callback - The callback function.
 */
function authenticate(User, creds, callback) {
  const name = creds.name;
  const password = creds.password;
  User.findOne({name: name}, function(err, user) {
    if (err) { // err indicates error, not no result found
      callback(500, {
        'message': err,
      });
      return;
    }

    if (user) { // found the user!
      user.comparePassword(password, function(err, isMatch) {
        if (isMatch) {
          callback(200, {});
        } else {
          callback(401, {
            'message': 'Invalid username or password.',
          });
        }
      });
    } else {
      callback(404, {
        'message': 'User ' + name + ' not found',
      });
    }
  });
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
 * Get a specific user.
 * @param {schema} User - The user mongoose schema.
 * @param {string} ident - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function getUser(User, ident, callback) {
  getUserById(User, ident, function(status, body) {
    if (status == 200) {
      callback(status, body);
    } else {
      // If user not found by ID, try name.
      getUserByName(User, ident, callback);
    }
  });
}

/**
 * Get a user based on its ID.
 * @param {schema} User - The user mongoose schema.
 * @param {string} id - The user ID.
 * @param {function} callback - The callback function.
 */
function getUserById(User, id, callback) {
  User.findById(id, function(err, user) {
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
        'message': 'User ' + id + ' not found.',
      });
    }
  });
}

/**
 * Get a user based on its name.
 * @param {schema} User - The user mongoose schema.
 * @param {string} name - The user name.
 * @param {function} callback - The callback function.
 */
function getUserByName(User, name, callback) {
  User.findOne({name: name}, function(err, user) {
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
        'message': 'User ' + name + ' not found.',
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
  user = new User(properties);

  user.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        // Duplicate username found
        callback(409, {
          'message': 'User name ' + properties.name + ' already exists!',
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
 * Delete a user.
 * @param {schema} User - The user mongoose schema.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {controller} groupController - The group conroller object.
 * @param {string} ident - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function deleteUser(User, groupSchema, groupController, ident, callback) {
  // First delete this user from all groups.
  getUser(User, ident, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }
    user = body.user;
    user.getGroups().forEach(function(groupId) {
      groupController.getGroup(
          groupSchema,
          groupId,
          function(groupStatus, groupBody) {
            if (groupStatus != 200) {
              return;
            }
            group = groupBody.group;
            group.deleteUser(user._id);
          });
    });
    deleteUserById(User, user._id, function(status, body) {
      callback(status, body);
    });
  });
}

/**
 * Delete a user by its ID.
 * @param {schema} User - The user mongoose schema.
 * @param {string} id - The user ID.
 * @param {function} callback - The callback function.
 */
function deleteUserById(User, id, callback) {
  User.findByIdAndRemove(id, function(err, user) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (user) {
      callback(200, {});
    } else {
      callback(404, {
        'message': 'User ' + id + ' not found.',
      });
    }
  });
}

module.exports = {
  authenticate,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
