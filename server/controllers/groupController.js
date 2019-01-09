// server/controllers/groupController.js

/**
 * List all groups.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {function} callback - The callback function.
 */
function listGroups(groupSchema, callback) {
  groupSchema.find({}, function(err, groups) {
    if (err) {
      callback({'status': false, 'message': 'Database error finding groups!'});
    } else {
      callback({'status': true, 'groups': groups});
    }
  });
}

/**
 * Get a specific group from the database.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {string} ident - Identifier for the group, either ID or name.
 * @param {function} callback - The callback function.
 */
function getGroup(groupSchema, ident, callback) {
  getGroupById(groupSchema, ident, function(res) {
    if (res.status) {
      callback(res);
    } else {
      // If user not found by ID, try name.
      getGroupsByName(groupSchema, ident, callback);
    }
  });
}

/**
 * Get a group from the database by ID.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {string} id - The group ID.
 * @param {function} callback - The callback function.
 */
function getGroupById(groupSchema, id, callback) {
  groupSchema.findById(id, function(err, group) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding group with id ' + id + '!'});
    } else if (group) {
      callback({'status': true, 'groups': [group]});
    } else {
      callback({
        'status': false,
        'message': 'Group with ID ' + id + ' not found!'});
    }
  });
}

/**
 * Get groups with a specific name from the database.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {string} name - The group name.
 * @param {function} callback - The callback function.
 */
function getGroupsByName(groupSchema, name, callback) {
  groupSchema.find({name: name}, function(err, groups) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding group with name ' + name + '!'});
    } else if (groups.length > 0) {
      callback({'status': true, 'groups': groups});
    } else {
      callback({
        'status': false,
        'message': 'Group with name ' + name + ' not found!'});
    }
  });
}

/**
 * Create a new group.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {object} properties - The group properties
 * @param {function} callback - The callback function.
 */
function createGroup(groupSchema, properties, callback) {
  group = new groupSchema(properties);

  group.save(function(err) {
    if (err) {
      console.log(err.message);
      callback({'status': false, 'message': 'Error saving group!'});
      return;
    }
    callback({'status': true, 'group': group});
  });
}

/**
 * Update an existing group.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {string} ident - The group identifier, either name or ID.
 * @param {object} properties - The group properties.
 * @param {function} callback - The callback function.
 */
function updateGroup(groupSchema, ident, properties, callback) {
  getGroup(groupSchema, ident, function(groupRes) {
    if (!groupRes.status) {
      callback({'status': false, 'message': groupRes.message});
      return;
    } else if (groupRes.groups.length > 1) {
      callback({
        'status': false,
        'message': 'More than one group found with name ' +
                   groupIdent + '. Use ID.'});
      return;
    }
    group = groupRes.groups[0];
    Object.assign(group, properties).save((err, group) => {
      if (err) {
        callback({'status': false, 'message': 'Error updating group!'});
      } else {
        callback({'status': true, 'group': group});
      }
    });
  });
}

/**
 * Add a user to a group.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {controller} userController - the user controller object.
 * @param {string} groupIdent - The group identifier, either name or ID.
 * @param {string} userIdent - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function addUser(groupSchema, userSchema, userController, groupIdent, userIdent, callback) {
  getGroup(groupSchema, groupIdent, function(groupRes) {
    if (!groupRes.status) {
      callback({'status': false, 'message': groupRes.message});
      return;
    } else if (groupRes.groups.length > 1) {
      callback({
        'status': false,
        'message': 'More than one group found with name ' +
                  groupIdent + '. Use ID.'});
      return;
    }
    group = groupRes.groups[0];
    userController.getUser(userSchema, userIdent, function(userRes) {
      if (!userRes.status) {
        callback({'status': false, 'message': userRes.message});
        return;
      }
      user = userRes.user;
      try {
        group.addUser(user._id, user.name);
        user.addGroup(group._id);
        callback({'status': true});
      } catch (err) {
        callback({
          'status': false,
          'message': 'Error adding user to group.'});
      }
    });
  });
}

/**
 * Remove a user from a group.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {controller} userController - The user controller object.
 * @param {string} groupIdent - The group identifier, either name or ID.
 * @param {string} userIdent - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function deleteUser(groupSchema, userSchema, userController, groupIdent, userIdent, callback) {
  getGroup(groupSchema, groupIdent, function(groupRes) {
    if (!groupRes.status) {
      callback({'status': false, 'message': groupRes.message});
      return;
    } else if (groupRes.groups.length > 1) {
      callback({
        'status': false,
        'message': 'More than one group found with name ' +
                   groupIdent + '. Use ID.'});
      return;
    }
    group = groupRes.groups[0];
    userController.getUser(userSchema, userIdent, function(userRes) {
      if (!userRes.status) {
        if (group.deleteUser(userIdent)) {
          callback({
            'status': true,
            'message': 'User not found in database and ' +
                       'successfully removed from group.'});
          return;
        } else {
          callback({'status': false, 'message': userRes.message});
          return;
        }
      }
      user = userRes.user;
      try {
        group.deleteUser(user._id);
        user.deleteGroup(group._id);
        callback({'status': true});
      } catch (err) {
        callback({
          'status': false,
          'message': 'Error deleting user from group.'});
      }
    });
  });
}

/**
 * Add a game to the group.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {controller} gameController - The game controller object.
 * @param {string} groupIdent - The identifier for the group, either name or ID.
 * @param {string} gameIdent - The identifier for the game, either name or ID.
 * @param {function} callback - The callback function.
 */
function addGame(groupSchema, gameSchema, gameController, groupIdent, gameIdent, callback) {
  getGroup(groupSchema, groupIdent, function(groupRes) {
    if (!groupRes.status) {
      callback({'status': false, 'message': groupRes.message});
      return;
    } else if (groupRes.groups.length > 1) {
      callback({
        'status': false,
        'message': 'More than one group found with name ' +
                   groupIdent + '. Use ID.'});
      return;
    }
    group = groupRes.groups[0];
    gameController.getGameDb(gameSchema, gameIdent, function(gameRes) {
      if (!gameRes.status) {
        callback({'status': false, 'message': gameRes.message});
        return;
      }
      game = gameRes.game;
      try {
        group.addGame(game._id);
        callback({'status': true});
      } catch (err) {
        callback({
          'status': false,
          'message': 'Error adding game to group.'});
      }
    });
  });
}

/**
 * Remove a game from a group.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {controller} gameController - The game controller object.
 * @param {string} groupIdent - The identifier for the group, either name or ID.
 * @param {string} gameIdent - The identifier for the game, either name or ID.
 * @param {function} callback - The callback funtion.
 */
function deleteGame(groupSchema, gameSchema, gameController, groupIdent, gameIdent, callback) {
  getGroup(groupSchema, groupIdent, function(groupRes) {
    if (!groupRes.status) {
      callback({'status': false, 'message': groupRes.message});
      return;
    } else if (groupRes.groups.length > 1) {
      callback({
        'status': false,
        'message': 'More than one group found with name ' +
                   groupIdent + '. Use ID.'});
      return;
    }
    group = groupRes.groups[0];
    gameController.getGameDb(gameSchema, gameIdent, function(gameRes) {
      if (!gameRes.status) {
        callback({'status': false, 'message': gameRes.message});
        return;
      }
      game = gameRes.game;
      try {
        group.deleteGame(game._id);
        callback({'status': true});
      } catch (err) {
        callback({
          'status': false,
          'message': 'Error deleting game from group.'});
      }
    });
  });
}

/**
 * Delete a group.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {schema} userSchema - The user mongoose schema.
 * @param {controller} userController - The user controller object.
 * @param {string} ident - The identifier for the group, either name or ID.
 * @param {function} callback - The callback function.
 */
function deleteGroup(groupSchema, userSchema, userController, ident, callback) {
  // First delete this group from all user lists.
  getGroup(groupSchema, ident, function(groupRes) {
    if (!groupRes.status) {
      callback(groupRes);
      return;
    }
    if (groupRes.groups.length > 1) {
      callback({
        'status': false,
        'message': 'Multiple groups found with name ' + ident +
        '. Must delete by ID.'});
      return;
    }
    group = groupRes.groups[0];
    group.getUsers().forEach(function(user) {
      userController.getUser(userSchema, user.id, function(userRes) {
        if (!userRes.status) {
          return;
        }
        user = userRes.user;
        user.deleteGroup(group._id);
      });
    });
    // Delete the group
    deleteGroupById(groupSchema, group._id, function(res) {
      callback(res);
    });
  });
}

/**
 * Delete a group using its ID.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {string} id - The group ID.
 * @param {function} callback - The callback function.
 */
function deleteGroupById(groupSchema, id, callback) {
  groupSchema.findByIdAndRemove(id, function(err, group) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding group with id ' + id + '!'});
    } else if (group) {
      callback({'status': true});
    } else {
      callback({
        'status': false,
        'message': 'group with ID ' + id + ' not found!'});
    }
  });
}

/**
 * Update the win/loss stats of a game in a group.
 * @param {schema} groupSchema - The group mongoose schema.
 * @param {string} groupIdent - The identifier for the group, either name or ID.
 * @param {string} gameIdent - The identifier for the game, either name or ID.
 * @param {array} winners - The list of winners of a game.
 * @param {array} players - The list of players of a game.
 * @param {function} callback - The callback function.
 */
function updateStats(groupSchema, groupIdent, gameIdent, winners, players, callback) {
  getGroup(groupSchema, groupIdent, function(groupRes) {
    if (!groupRes.status) {
      callback({'status': false, 'message': groupRes.message});
      return;
    } else if (groupRes.groups.length > 1) {
      callback({
        'status': false,
        'message': 'More than one group found with name ' +
                   groupIdent + '. Use ID.'});
      return;
    }
    const group = groupRes.groups[0];
    if (group.findGameIndex(gameIdent) < 0) {
      callback({
        'status': false,
        'message': 'Game ' + gameIdent + ' not found in group ' + group.name});
      return;
    }
    for (let i = 0; i < group.users.length; i++) {
      for (let j = 0; j < group.users.stats.length; j++) {
        if (players.indexOf(group.users[i]) >= 0 &&
            group.users[i].stats[j].game == game) {
          if (winners.indexOf(group.users[i].username) >= 0) {
            group.users[i].stats[j].wins += 1;
          } else {
            group.users[i].stats[j].losses += 1;
          }
        }
      }
    }
  });
}


module.exports ={
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  addUser,
  deleteUser,
  addGame,
  deleteGame,
  deleteGroup,
  updateStats,
};
