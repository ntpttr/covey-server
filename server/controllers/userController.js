const User = require('../models/User');

/**
 * Authenticate a user based on credentials.
 * @param {object} creds - The credentials to check.
 * @param {function} callback - The callback function.
 */
function authenticate(creds, callback) {
  const name = creds.name;
  const password = creds.password;
  User.findOne({name: name}, function(err, user) {
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
 * @param {function} callback - The callback function.
 */
function listUsers(callback) {
  User.find({}, function(err, users) {
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
 * @param {string} ident - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function getUser(ident, callback) {
  getUserById(ident, function(res) {
    if (res.status) {
      callback(res);
    } else {
      // If user not found by ID, try name.
      getUserByName(ident, callback);
    }
  });
}

/**
 * Get a user based on its ID.
 * @param {string} id - The user ID.
 * @param {function} callback - The callback function.
 */
function getUserById(id, callback) {
  User.findById(id, function(err, user) {
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
 * @param {string} name - The user name.
 * @param {function} callback - The callback function.
 */
function getUserByName(name, callback) {
  User.findOne({name: name}, function(err, user) {
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
 * @param {object} properties - The user properties.
 * @param {function} callback - The callback function.
 */
function createUser(properties, callback) {
  user = new User(properties);

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
 * @param {string} ident - The user identifier, either name or ID.
 * @param {object} properties - The properties for the user.
 * @param {function} callback - The callback function.
 */
function updateUser(ident, properties, callback) {
  getUser(ident, function(userRes) {
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
 * @param {string} ident - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function deleteUser(ident, callback) {
  // First delete this user from all groups.
  getUser(ident, function(userRes) {
    if (!userRes.status) {
      callback(userRes);
      return;
    }
    user = userRes.user;
    user.getGroups().forEach(function(groupId) {
      const groupController = require('./groupController');
      groupController.getGroup(groupId, function(groupRes) {
        if (!groupRes.status) {
          return;
        }
        group = groupRes.groups[0];
        group.deleteUser(user._id);
      });
    });
    deleteUserById(user._id, function(res) {
      callback(res);
    });
  });
}

/**
 * Delete a user by its ID.
 * @param {string} id - The user ID.
 * @param {function} callback - The callback function.
 */
function deleteUserById(id, callback) {
  User.findByIdAndRemove(id, function(err, user) {
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
