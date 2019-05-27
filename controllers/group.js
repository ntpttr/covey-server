// server/controllers/groupController.js

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
 * Get groups with a specific name from the database.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} displayName - The group name.
 * @param {function} callback - The callback function.
 */
function getGroup(Group, displayName, callback) {
  Group.findOne({name: displayName}, function(err, group) {
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
        'message': 'Group ' + displayName + ' not found.',
      });
    }
  });
}

/**
 * Update an existing group.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} name - The group name.
 * @param {object} properties - The group properties.
 * @param {function} callback - The callback function.
 */
function updateGroup(Group, name, properties, callback) {
  getGroup(Group, name, function(status, body) {
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
 * @param {string} displayName - The group name.
 * @param {string} username - The username.
 * @param {function} callback - The callback function.
 */
function addUser(Group, User, userController, displayName, username, callback) {
  userController.getUser(User, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback({userStatus, userBody});
      return;
    }

    user = userBody.user;
    Group.findOneAndUpdate({
      name: displayName,
    }, {
      $addToSet: {
        users: user._id,
      },
    }, {
      new: true,
    }).exec(function(err, group) {
      if (err) {
        callback(500, {
          'message': err,
        });

        return;
      }

      if (group == null) {
        callback(404, {
          'message': 'Group ' + displayName + ' not found.'
        });

        return;
      }

      userController.addGroupLink(
          User, user.username, group._id, function(addStatus, addBody) {
            if (addStatus != 200) {
              callback(addStatus, addBody);
              return;
            }

            callback(200, {
              'group': group,
              'user': addBody.user.toProfileJSON(),
              'message': 'User ' + username +
              ' added to group ' + displayName + '.',
            });
          });
    });
  });
}

/**
 * Remove a user from a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} User - The user mongoose schema.
 * @param {controller} userController - The user controller object.
 * @param {string} displayName - The group name.
 * @param {string} username - The username.
 * @param {function} callback - The callback function.
 */
function deleteUser(
    Group, User, userController, displayName, username, callback) {
  userController.getUser(User, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback({userStatus, userBody});
      return;
    }

    user = userBody.user;
    Group.findOneAndUpdate({
      name: displayName,
    }, {
      $pull: {
        users: user._id,
      },
    }, {
      new: true,
    }).exec(function(err, group) {
      if (err) {
        callback(500, {
          'message': err,
        });

        return;
      }

      if (group == null) {
        callback(404, {
          'message': 'Group ' + displayName + ' not found.'
        });

        return;
      }

      userController.removeGroupLink(
          User, user.username, group._id, function(removeStatus, removeBody) {
            if (removeStatus != 200) {
              callback(addStatus, removeBody);
              return;
            }

            callback(200, {
              'group': group,
              'user': removeBody.user.toProfileJSON(),
              'message': 'User ' + username +
                         ' removed from group ' + displayName + '.',
            });
          });
    });
  });
}

/**
 * Add a game to the group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {controller} gameController - The game controller object.
 * @param {string} displayName - The group name.
 * @param {string} gameName - The game name.
 * @param {function} callback - The callback function.
 */
function addGame(
    Group, gameSchema, gameController, displayName, gameName, callback) {
  getGroup(Group, displayName, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }

    group = body.group;
    gameController.getGameDb(
        gameSchema, gameName, function(gameStatus, gameBody) {
          if (gameStatus != 200) {
            callback(gameStatus, gameBody);
            return;
          }

          game = gameBody.game;
          Group.findOneAndUpdate({
            name: displayName,
          }, {
            $addToSet: {
              games: game._id,
            },
          }, {
            new: true,
          }).exec(function(err, group) {
            if (err) {
              callback(500, {
                'message': err,
              });

              return;
            }

            callback(200, {
              'group': group,
            });
          });
        });
  });
}

/**
 * Remove a game from a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {controller} gameController - The game controller object.
 * @param {string} displayName - The group name.
 * @param {string} gameName - The game name.
 * @param {function} callback - The callback funtion.
 */
function deleteGame(
    Group, gameSchema, gameController, displayName, gameName, callback) {
  getGroup(Group, displayName, function(status, body) {
    if (status != 200) {
      callback(status, body);
      return;
    }

    group = body.group;
    gameController.getGameDb(
        gameSchema, gameName, function(gameStatus, gameBody) {
          if (gameStatus != 200) {
            callback(gameStatus, gameBody);
            return;
          }

          game = gameBody.game;
          Group.findOneAndUpdate({
            name: displayName,
          }, {
            $pull: {
              users: user._id,
            },
          }, {
            new: true,
          }).exec(function(err, group) {
            if (err) {
              callback(500, {
                'message': err,
              });

              return;
            }

            callback(200, {
              'group': group,
            });
          });
        });
  });
}

/**
 * Delete a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} User - The user mongoose schema.
 * @param {string} groupName - The group name.
 * @param {function} callback - The callback function.
 */
function deleteGroup(Group, User, groupName, callback) {
  Group.findOne({
    name: groupName,
  }).populate('users').exec(function(err, group) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (group) {
      // First delete this group from all user lists.
      group.users.forEach(function(user) {
        User.update({
          _id: user._id,
        }, {
          $pull: {
            groups: group._id,
          },
        }).exec(function(err) {
          if (err) {
            console.log(err);
          }
        });
      });

      group.remove();

      callback(200, {
        'message': 'group ' + groupName + ' deleted successfully',
      });
    } else {
      callback(404, {
        'message': 'group ' + groupName + ' not found',
      });
    }
  });
}

module.exports = {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  addUser,
  deleteUser,
  addGame,
  deleteGame,
  deleteGroup,
};
