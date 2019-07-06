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
      if (err.errors.name) {
        callback(409, {
          'message': 'Group name ' + err.errors.name.value +
                     ' is already taken.',
        });

        return;
      } else {
        callback(500, {
          'error': err,
        });
  
        return;
      }
    }

    callback(201, {
      'group': group,
    });
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
        'error': err,
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
          'error': err,
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
 * @param {string} username - The username to add.
 * @param {function} callback - The callback function.
 */
function addUser(Group, User, userController, displayName, username, callback) {
  userController.getUserDetails(User, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
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
          'error': err,
        });

        return;
      }

      if (group == null) {
        callback(404, {
          'message': 'Group ' + displayName + ' not found.',
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
 * @param {string} username - The username to remove.
 * @param {function} callback - The callback function.
 */
function deleteUser(Group, User, userController, displayName, username, callback) {
  userController.getUserDetails(User, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
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
          'error': err,
        });

        return;
      }

      if (group == null) {
        callback(404, {
          'message': 'Group ' + displayName + ' not found.',
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
 * @param {string} displayName - The group name.
 * @param {string} gameProperties - The game properties.
 * @param {function} callback - The callback function.
 */
function addGame(Group, displayName, gameProperties, callback) {
  const {
    name,
    description,
    thumbnail,
    image,
    minPlayers,
    maxPlayers,
    playingTime,
  } = gameProperties;

  if (!name) {
    callback(400, {
      'message': 'Must provide a game name',
    });

    return;
  }

  Group.findOneAndUpdate({
    'name': displayName,
    'games.name': {
      $ne: name,
    },
  }, {
    $push: {
      games: {
        name,
        description,
        thumbnail,
        image,
        minPlayers,
        maxPlayers,
        playingTime,
      },
    },
  }, {
    new: true,
  }).exec(function(err, group) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (!group) {
      callback(404, {
        'message': 'Group ' + displayName +
        ' doesn\'t exist or already contains ' + name + '.',
      });

      return;
    }

    callback(200, {
      'group': group,
      'message': name + ' added to group ' + displayName,
    });
  });
}

/**
 * Remove a game from a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} displayName - The group name.
 * @param {string} gameName - The game name.
 * @param {function} callback - The callback funtion.
 */
function deleteGame(Group, displayName, gameName, callback) {
  Group.findOneAndUpdate({
    name: displayName,
  }, {
    $pull: {
      games: {
        name: gameName,
      },
    },
  }, {
    new: true,
  }).exec(function(err, group) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (!group) {
      callback(404, {
        'message': 'Group ' + displayName + ' not found.',
      });

      return;
    }

    callback(200, {
      'group': group,
      'message': gameName + ' removed from group ' + displayName,
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
  getGroup,
  createGroup,
  updateGroup,
  addUser,
  deleteUser,
  addGame,
  deleteGame,
  deleteGroup,
};
