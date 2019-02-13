// server/controllers/groupController.js

/**
 * List all groups.
 * @param {schema} Group - The group mongoose schema.
 * @param {function} callback - The callback function.
 */
function listGroups(Group, callback) {
  Group.find({}, function(err, groups) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else {
      callback(200, {
        'groups': groups,
      });
    }
  });
}

/**
 * Get a specific group from the database.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} ident - Identifier for the group, either ID or name.
 * @param {function} callback - The callback function.
 */
function getGroup(Group, ident, callback) {
  getGroupById(Group, ident, function(status, body) {
    if (status == 200) {
      callback(status, body);
    } else {
      // If user not found by ID, try name.
      getGroupByName(Group, ident, callback);
    }
  });
}

/**
 * Get a group from the database by ID.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} id - The group ID.
 * @param {function} callback - The callback function.
 */
function getGroupById(Group, id, callback) {
  Group.findById(id, function(err, group) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (group) {
      callback(200, {
        'group': group,
      });
    } else {
      callback(404, {
        'message': 'Group ' + id + ' not found.',
      });
    }
  });
}

/**
 * Get groups with a specific name from the database.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} name - The group name.
 * @param {function} callback - The callback function.
 */
function getGroupByName(Group, name, callback) {
  Group.findOne({name: name}, function(err, group) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (group) {
      callback(200, {
        'group': group,
      });
    } else {
      callback(404, {
        'message': 'Group ' + name + ' not found.',
      });
    }
  });
}

/**
 * Create a new group.
 * @param {schema} Group - The group mongoose schema.
 * @param {object} properties - The group properties
 * @param {function} callback - The callback function.
 */
function createGroup(Group, properties, callback) {
  group = new Group(properties);

  group.save(function(err) {
    if (err) {
      callback(500, {
        'message': err,
      });
      return;
    }
    callback(201, {
      'group': group,
    });
  });
}

/**
 * Update an existing group.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} ident - The group identifier, either name or ID.
 * @param {object} properties - The group properties.
 * @param {function} callback - The callback function.
 */
function updateGroup(Group, ident, properties, callback) {
  getGroup(Group, ident, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }
    group = body.group;
    Object.assign(group, properties).save((err, group) => {
      if (err) {
        callback(500, {
          'message': err,
        });
      } else {
        callback(200, {
          'group': group,
        });
      }
    });
  });
}

/**
 * Add a user to a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} User - The user mongoose schema.
 * @param {controller} userController - the user controller object.
 * @param {string} groupIdent - The group identifier, either name or ID.
 * @param {string} userIdent - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function addUser(Group,
    User,
    userController,
    groupIdent,
    userIdent,
    callback) {
  getGroup(Group, groupIdent, function(status, body) {
    if (status != 200) {
      callback({status, body});
      return;
    }
    group = body.group;
    userController.getUser(
        User,
        userIdent,
        function(userStatus, userBody) {
          if (userStatus != 200) {
            callback({userStatus, userBody});
            return;
          }
          user = userBody.user;
          try {
            group.addUser(user._id, user.name);
            user.addGroup(group._id);
            callback(200, {
              'group': group,
            });
          } catch (err) {
            callback(500, {
              'message': err,
            });
          }
        });
  });
}

/**
 * Remove a user from a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} User - The user mongoose schema.
 * @param {controller} userController - The user controller object.
 * @param {string} groupIdent - The group identifier, either name or ID.
 * @param {string} userIdent - The user identifier, either name or ID.
 * @param {function} callback - The callback function.
 */
function deleteUser(
    Group,
    User,
    userController,
    groupIdent,
    userIdent,
    callback) {
  getGroup(Group, groupIdent, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }
    group = body.group;
    userController.getUser(
        User,
        userIdent,
        function(userStatus, userBody) {
          if (userStatus != 200) {
            if (group.deleteUser(userIdent)) {
              callback(200, {});
              return;
            } else {
              callback(userStatus, userBody);
              return;
            }
          }
          user = userBody.user;
          try {
            group.deleteUser(user._id);
            user.deleteGroup(group._id);
            callback(200, {
              'group': group,
            });
          } catch (err) {
            callback(500, {
              'message': err,
            });
          }
        });
  });
}

/**
 * Add a game to the group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {controller} gameController - The game controller object.
 * @param {string} groupIdent - The identifier for the group, either name or ID.
 * @param {string} gameIdent - The identifier for the game, either name or ID.
 * @param {function} callback - The callback function.
 */
function addGame(
    Group,
    gameSchema,
    gameController,
    groupIdent,
    gameIdent,
    callback) {
  getGroup(Group, groupIdent, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }
    group = body.group;
    gameController.getGameDb(
        gameSchema,
        gameIdent,
        function(gameStatus, gameBody) {
          if (gameStatus != 200) {
            callback(gameStatus, gameBody);
            return;
          }
          game = gameBody.game;
          try {
            group.addGame(game._id);
            callback(200, {
              'group': group,
            });
          } catch (err) {
            callback(500, {
              'message': err,
            });
          }
        });
  });
}

/**
 * Remove a game from a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {controller} gameController - The game controller object.
 * @param {string} groupIdent - The identifier for the group, either name or ID.
 * @param {string} gameIdent - The identifier for the game, either name or ID.
 * @param {function} callback - The callback funtion.
 */
function deleteGame(
    Group,
    gameSchema,
    gameController,
    groupIdent,
    gameIdent,
    callback) {
  getGroup(Group, groupIdent, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }
    group = body.group;
    gameController.getGameDb(
        gameSchema,
        gameIdent,
        function(gameStatus, gameBody) {
          if (gameStatus != 200) {
            callback(gameStatus, gameBody);
            return;
          }
          game = gameBody.game;
          try {
            group.deleteGame(game._id);
            callback(200, {
              'group': group,
            });
          } catch (err) {
            callback(500, {
              'message': err,
            });
          }
        });
  });
}

/**
 * Delete a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} User - The user mongoose schema.
 * @param {controller} userController - The user controller object.
 * @param {string} ident - The identifier for the group, either name or ID.
 * @param {function} callback - The callback function.
 */
function deleteGroup(Group, User, userController, ident, callback) {
  // First delete this group from all user lists.
  getGroup(Group, ident, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }
    group = body.group;
    group.getUsers().forEach(function(user) {
      userController.getUser(
          User,
          user.id,
          function(userStatus, userBody) {
            if (userStatus != 200) {
              return;
            }
            user = userBody.user;
            user.deleteGroup(group._id);
          });
    });
    // Delete the group
    deleteGroupById(Group, group._id, function(status, body) {
      callback(status, body);
    });
  });
}

/**
 * Delete a group using its ID.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} id - The group ID.
 * @param {function} callback - The callback function.
 */
function deleteGroupById(Group, id, callback) {
  Group.findByIdAndRemove(id, function(err, group) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (group) {
      callback(200, {});
    } else {
      callback(404, {
        'message': 'Group ' + id + ' not found.',
      });
    }
  });
}

/**
 * Update the win/loss stats of a game in a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} groupIdent - The identifier for the group, either name or ID.
 * @param {string} gameIdent - The identifier for the game, either name or ID.
 * @param {array} winners - The list of winners of a game.
 * @param {array} players - The list of players of a game.
 * @param {function} callback - The callback function.
 */
function updateStats(Group, groupIdent, gameIdent, winners, players, callback) {
  getGroup(Group, groupIdent, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }
    const group = body.group;
    if (group.findGameIndex(gameIdent) < 0) {
      callback(404, {
        'message': 'Game ' + gameIdent + ' not found.',
      });
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
