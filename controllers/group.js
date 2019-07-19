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
      if (err.errors && err.errors.identifier) {
        switch (err.errors.identifier.kind) {
          case "unique":
            callback(409, {
              'message': 'Group identifier ' +
                          err.errors.identifier.value +
                          ' is already taken.',
            });
    
            return;
          case "regexp":
            callback(409, {
              'message': 'Group identifier ' +
                          err.errors.identifier.value +
                          ' is invalid.',
            });
    
            return;
          default:
            break;
        }
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
 * Get groups with a specific identifier from the database.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} identifier - The group identifier.
 * @param {function} callback - The callback function.
 */
function getGroup(Group, identifier, callback) {
  Group.findOne({identifier: identifier}, function(err, group) {
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
        'message': 'Group ' + identifier + ' not found.',
      });
    }
  });
}

/**
 * Get a group's members
 * @param {schema} Group - The group mongoose schema.
 * @param {string} identifier - The group identifier.
 * @param {function} callback - The callback function.
 */
function getGroupMembers(Group, identifier, callback) {
  Group.findOne({identifier: identifier}).
      populate('members').
      exec(function(err, group) {
        if (err) {
          callback(500, {
            'error': err,
          });
        } else if (group) {
          // Return only a basic view of each user
          const members = [];
          group.members.forEach(function(user) {
            members.push(user.ProfileView());
          });

          callback(200, {
            'members': members,
          });
        } else {
          callback(404, {
            'message': 'user not found',
          });
        }
      });
}

/**
 * Update an existing group.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} identifier - The group identifier.
 * @param {object} properties - The group properties.
 * @param {function} callback - The callback function.
 */
function updateGroup(Group, identifier, properties, callback) {
  getGroup(Group, identifier, function(status, body) {
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
 * @param {string} identifier - The group identifier.
 * @param {string} username - The username to add.
 * @param {function} callback - The callback function.
 */
function addUser(Group, User, userController, identifier, username, callback) {
  userController.getUserProfile(User, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
      return;
    }

    user = userBody.user;
    Group.findOneAndUpdate(
      {identifier: identifier},
      {$addToSet: {members: user._id}},
      {new: true}
    ).exec(function(err, group) {
      if (err) {
        callback(500, {
          'error': err,
        });

        return;
      }

      if (group == null) {
        callback(404, {
          'message': 'Group ' + identifier + ' not found.',
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
              'message': 'User ' + username +
              ' added to group ' + identifier + '.',
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
 * @param {string} identifier - The group identifier.
 * @param {string} username - The username to remove.
 * @param {function} callback - The callback function.
 */
function deleteUser(Group, User, userController, identifier, username, callback) {
  userController.getUserProfile(User, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
      return;
    }

    user = userBody.user;
    Group.findOneAndUpdate(
      {identifier: identifier},
      {$pull: {members: user._id}},
      {new: true}
    ).exec(function(err, group) {
      if (err) {
        callback(500, {
          'error': err,
        });

        return;
      }

      if (group == null) {
        callback(404, {
          'message': 'Group ' + identifier + ' not found.',
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
              'message': 'User ' + username +
                         ' removed from group ' + identifier + '.',
            });
          });
    });
  });
}

/**
 * Add a game to the group.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} identifier - The group identifier.
 * @param {string} gameProperties - The game properties.
 * @param {function} callback - The callback function.
 */
function addGame(Group, identifier, gameProperties, callback) {
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

  Group.findOneAndUpdate(
    {'identifier': identifier, 'games.name': {$ne: name}}, 
    {
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
    },
    {new: true}
  ).exec(function(err, group) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (!group) {
      callback(404, {
        'message': 'Group ' + identifier +
        ' doesn\'t exist or already contains ' + name + '.',
      });

      return;
    }

    callback(200, {
      'message': name + ' added to group ' + identifier,
    });
  });
}

/**
 * Remove a game from a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} identifier - The group identifier.
 * @param {string} gameName - The game name.
 * @param {function} callback - The callback funtion.
 */
function deleteGame(Group, identifier, gameName, callback) {
  Group.findOneAndUpdate(
    {identifier: identifier},
    {$pull: {games: {name: gameName}}}, 
    {new: true}
  ).exec(function(err, group) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (!group) {
      callback(404, {
        'message': 'Group ' + identifier + ' not found.',
      });

      return;
    }

    callback(200, {
      'message': gameName + ' removed from group ' + identifier,
    });
  });
}

/**
 * Delete a group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} User - The user mongoose schema.
 * @param {string} identifier - The group identifier.
 * @param {function} callback - The callback function.
 */
function deleteGroup(Group, User, identifier, callback) {
  Group.findOne({
    identifier: identifier,
  }).populate('members').exec(function(err, group) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (group) {
      // First delete this group from all user lists.
      group.members.forEach(function(user) {
        User.update(
          {_id: user._id},
          {$pull: {groups: group._id}}
        ).exec(function(err) {
          if (err) {
            console.log(err);
          }
        });
      });

      group.remove();

      callback(200, {
        'message': 'group ' + identifier + ' deleted successfully',
      });
    } else {
      callback(404, {
        'message': 'group ' + identifier + ' not found',
      });
    }
  });
}

module.exports = {
  createGroup,
  getGroup,
  getGroupMembers,
  updateGroup,
  addUser,
  deleteUser,
  addGame,
  deleteGame,
  deleteGroup,
};
