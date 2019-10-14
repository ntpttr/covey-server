// server/controllers/groupController.js

/**
 * Create a new group.
 * @param {schema} Group - The group mongoose schema.
 * @param {schema} User - The user mongoose schema.
 * @param {string} creator - The group creator.
 * @param {controller} userController - The user controller object.
 * @param {object} properties - The group properties.
 * @param {function} callback - The callback function.
 */
function createGroup(Group, User, creator, userController, properties, callback) {
  userController.getUserProfile(User, creator, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
      return;
    }

    const {
      identifier,
      displayName,
      description,
    } = properties;

    group = new Group({
      'identifier': identifier,
      'displayName': displayName,
      'description': description,
      'numMembers': 1,
    });

    user = userBody.user;

    group.members.push({
      'username': user.username,
      'link': user,
    });

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
    });

    userController.addGroupLink(
      User, user.username, group._id, function(addStatus, addBody) {
        if (addStatus != 200) {
          deleteGroup(Group, User, group.identifier, function(deleteStatus, deleteBody) {
            callback(500, {
              'message': 'Something went wrong adding creator to the group.',
            });
  
            return;
          });
        }

        callback(201, {
          'group': group
        });
      });
  });
}

/**
 * Get groups with a specific identifier from the database
 * if the calling user is authorized for the group.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} identifier - The group identifier.
 * @param {string} actingUser - The user making the get group request.
 * @param {function} callback - The callback function.
 */
function getGroup(Group, identifier, actingUser, callback) {
  Group.findOne({
    'identifier': identifier,
    'members.username': actingUser,
  }).
    populate('members.link').
    exec(function(err, group) {
      if (err) {
        callback(500, {
          'error': err,
        });
      } else if (group) {
        const members = [];
        group.members.forEach(function(member) {
          members.push(member.link.ProfileView());
        });
        callback(200, {
          'group': group,
          'members': members
        });

        return;
      }

      callback(404, {
        'message': 'Group ' + identifier + ' not found.',
      });
  });
}

/**
 * Update an existing group.
 * @param {schema} Group - The group mongoose schema.
 * @param {string} identifier - The group identifier.
 * @param {string} actingUser - The user making the get group request.
 * @param {object} properties - The group properties.
 * @param {function} callback - The callback function.
 */
function updateGroup(Group, identifier, actingUser, properties, callback) {
  getGroup(Group, identifier, actingUser, function(status, body) {
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
 * @param {string} actingUser - The user making the get group request.
 * @param {string} username - The username to add.
 * @param {function} callback - The callback function.
 */
function addUser(Group, User, userController, identifier, actingUser, username, callback) {
  userController.getUserProfile(User, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
      return;
    }

    user = userBody.user;

    Group.findOneAndUpdate(
      {
        'identifier': identifier,
        'members.username': actingUser,
      },
      {
        '$addToSet': {
          'members': {
            'username': user.username,
            'link': user,
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
 * @param {string} actingUser - The user making the get group request.
 * @param {string} username - The username to remove.
 * @param {function} callback - The callback function.
 */
function deleteUser(Group, User, userController, identifier, actingUser, username, callback) {
  userController.getUserProfile(User, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
      return;
    }

    user = userBody.user;
    Group.findOne({
        'identifier': identifier,
        'members.username': actingUser,
    }).exec(function(err, group) {
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

      if (group.members.length == 1) {
        callback(403, {
          'message': 'Cannot remove last member from the group.',
        });

        return;
      }

      // Remove the member from the group
      for(var i = 0; i < group.members.length; i++) {
        if(group.members[i].username == user.username) {
            group.members.splice(i, 1);
            break;
        }
      }

      group.save();

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
 * @param {string} actingUser - The user making the get group request.
 * @param {string} gameProperties - The game properties.
 * @param {function} callback - The callback function.
 */
function addGame(Group, identifier, actingUser, gameProperties, callback) {
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
    {
      'identifier': identifier,
      'members.username': actingUser,
    }, 
    {
      $addToSet: {
        'games': {
          'name': name,
          'description': description,
          'thumbnail': thumbnail,
          'image': image,
          'minPlayers': minPlayers,
          'maxPlayers': maxPlayers,
          'playingTime': playingTime,
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
 * @param {string} actingUser - The user making the get group request.
 * @param {string} gameName - The game name.
 * @param {function} callback - The callback funtion.
 */
function deleteGame(Group, identifier, actingUser, gameName, callback) {
  Group.findOneAndUpdate({
      'identifier': identifier,
      'members.username': actingUser,
    },
    {
      $pull: {
        'games': {
          'name': gameName
        }
      }
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
 * @param {string} actingUser - The user deleting the group.
 * @param {function} callback - The callback function.
 */
function deleteGroup(Group, User, identifier, actingUser, callback) {
  Group.findOne({
      'identifier': identifier,
      'members.username': actingUser,
    }).populate('members.link').exec(function(err, group) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    if (group) {
      // First delete this group from all user lists.
      group.members.forEach(function(member) {
        User.update(
          {_id: member.link._id},
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
  updateGroup,
  addUser,
  deleteUser,
  addGame,
  deleteGame,
  deleteGroup,
};
