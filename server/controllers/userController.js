// server/controllers/userController.js

/**
 * Authenticate a user based on credentials.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {object} creds - The credentials to check.
 * @param {function} callback - The callback function.
 */
function authenticate(userSchema, creds, callback) {
  const name = creds.name;
  const password = creds.password;
  userSchema.findOne({name: name}, function(err, user) {
    if (err) { // err indicates error, not no result found
      callback({'err': err});
      return;
    }

    if (user) { // found the user!
      user.comparePassword(password, function(err, isMatch) {
        callback({'status': isMatch, 'foundUser': true});
      });
    } else {
      callback({'status': false, 'foundUser': false});
    }
  });
};

/**
 * List users in the database.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {function} callback - The callback function.
 */
function listUsers(userSchema, callback) {
  userSchema.find({}, function(err, users) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding users!'});
    } else {
      callback({'status': true, 'users': users});
    }
  });
}

/**
 * Get a specific user.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {string} ident - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function getUser(userSchema, ident, callback) {
  getUserById(userSchema, ident, function(res) {
    if (res.status) {
      callback(res);
    } else {
      // If user not found by ID, try name.
      getUserByName(userSchema, ident, callback);
    }
  });
}

/**
 * Get a user based on its ID.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {string} id - The user ID.
 * @param {function} callback - The callback function.
 */
function getUserById(userSchema, id, callback) {
  userSchema.findById(id, function(err, user) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding user with id ' + id + '!'});
    } else if (user) {
      callback({'status': true, 'user': user});
    } else {
      callback({
        'status': false,
        'message': 'User with ID ' + id + ' not found!'});
    }
  });
}

/**
 * Get a user based on its name.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {string} name - The user name.
 * @param {function} callback - The callback function.
 */
function getUserByName(userSchema, name, callback) {
  userSchema.findOne({name: name}, function(err, user) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding user with name ' + name + '!'});
    } else if (user) {
      callback({'status': true, 'user': user});
    } else {
      callback({
        'status': false,
        'message': 'User with name ' + name + ' not found!'});
    }
  });
}

/**
 * Create a new user.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {object} properties - The user properties.
 * @param {function} callback - The callback function.
 */
function createUser(userSchema, properties, callback) {
  user = new userSchema(properties);

  user.save(function(err) {
    if (err) {
      let errMessage = '';
      if (err.code === 11000) {
        // Duplicate username found
        errMessage = 'Username already exists!';
      } else {
        errMessage = 'Error saving user!';
      }
      callback({'status': false, 'message': errMessage});
      return;
    }
    callback({'status': true, 'user': user});
  });
}

/**
 * Update an existing user.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {string} ident - The user identifier, either name or ID.
 * @param {object} properties - The properties for the user.
 * @param {function} callback - The callback function.
 */
function updateUser(userSchema, ident, properties, callback) {
  getUser(userSchema, ident, function(userRes) {
    if (!userRes.status) {
      callback(userRes);
      return;
    }
    user = userRes.user;
    Object.assign(user, properties).save((err, user) => {
      if (err) {
        callback({'status': false, 'message': 'Error updating user!'});
      } else {
        callback({'status': true, 'user': user});
      }
    });
  });
}

/**
 * Delete a user.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {controller} groupController - The group conroller object.
 * @param {string} ident - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function deleteUser(userSchema, groupSchema, groupController, ident, callback) {
  // First delete this user from all groups.
  getUser(userSchema, ident, function(userRes) {
    if (!userRes.status) {
      callback(userRes);
      return;
    }
    user = userRes.user;
    user.getGroups().forEach(function(groupId) {
      groupController.getGroup(groupSchema, groupId, function(groupRes) {
        if (!groupRes.status) {
          return;
        }
        group = groupRes.groups[0];
        group.deleteUser(user._id);
      });
    });
    deleteUserById(userSchema, user._id, function(res) {
      callback(res);
    });
  });
}

/**
 * Delete a user by its ID.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {string} id - The user ID.
 * @param {function} callback - The callback function.
 */
function deleteUserById(userSchema, id, callback) {
  userSchema.findByIdAndRemove(id, function(err, user) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding user with id ' + id + '!'});
    } else if (user) {
      callback({'status': true});
    } else {
      callback({
        'status': false,
        'message': 'User with ID ' + id + ' not found!'});
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
