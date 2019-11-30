// server/controllers/groupController.js

/**
 * Create a new group.
 * @param {*} models - The mongoose schemas.
 * @param {*} controllers - The controllers.
 * @param {string} creator - The group creator.
 * @param {object} properties - The group properties.
 * @param {function} callback - The callback function.
 */
function createGroup(models, controllers, creator, properties, callback) {
  controllers.user.getUserProfile(models, creator, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
      return;
    }

    const {
      identifier,
      displayName,
      description,
    } = properties;

    group = new models.Group({
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

    group.owners.push(user.username);

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

      controllers.user.addGroupLink(
        models, user.username, group._id, function(addStatus, addBody) {
          if (addStatus != 200) {
            deleteGroup(models, group.identifier, function(deleteStatus, deleteBody) {
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
  });
}

/**
 * Get groups with a specific identifier from the database
 * if the calling user is authorized for the group.
 * @param {*} models - The mongoose schemas.
 * @param {string} identifier - The group identifier.
 * @param {string} actingUser - The user making the get group request.
 * @param {function} callback - The callback function.
 */
function getGroup(models, identifier, actingUser, callback) {
  models.Group.findOne({
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
          let memberProfile = member.link.ProfileView();
          memberProfile.isOwner = group.owners.includes(member.username) ? true : false;
          members.push(memberProfile);
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
 * @param {*} models - The mongoose schemaa.
 * @param {string} identifier - The group identifier.
 * @param {string} actingUser - The user making the get group request.
 * @param {object} properties - The group properties.
 * @param {function} callback - The callback function.
 */
function updateGroup(models, identifier, actingUser, properties, callback) {
  getGroup(models, identifier, actingUser, function(status, body) {
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
 * @param {*} models - The mongoose schemas.
 * @param {*} controllers - The controllers.
 * @param {string} identifier - The group identifier.
 * @param {string} actingUser - The user making the get group request.
 * @param {string} username - The username to add.
 * @param {function} callback - The callback function.
 */
function addMember(models, controllers, identifier, actingUser, username, callback) {
  controllers.user.getUserProfile(models, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
      return;
    }

    user = userBody.user;

    // Add the new member to the group, provided that the group exists and that
    // the acting user is a member and owner of the group.
    models.Group.findOne({
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

      // If the acting user is not an owner, don't allow them to add
      // new members to the group.
      if (!group.owners.includes(actingUser)) {
        callback(403, {
          'message': 'Only group owners can add new members.',
        });

        return;
      }

      // If the member being added is already in the group, don't add
      // them again.
      for (let i = 0; i < group.members.length; i++) {
        if (group.members[i].username == user.username) {
          callback(200, {
            'message': 'User ' + user.username + ' already ' +
                        'a member of group ' + identifier
          });

          return;
        }
      }

      group.members.push({
        'username': user.username,
        'link': user,
      });

      group.save(function(err) {
        if (err) {
          callback(500, {
            'error': err,
          });
        }

        controllers.user.addGroupLink(
          models, user.username, group._id, function(addStatus, addBody) {
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
  });
}

/**
 * Remove a user from a group.
 * @param {*} models - The mongoose schemas.
 * @param {*} controllers - The controllers.
 * @param {string} identifier - The group identifier.
 * @param {string} actingUser - The user making the get group request.
 * @param {string} username - The username to remove.
 * @param {function} callback - The callback function.
 */
function removeMember(models, controllers, identifier, actingUser, username, callback) {
  controllers.user.getUserProfile(models, username, function(userStatus, userBody) {
    if (userStatus != 200) {
      callback(userStatus, userBody);
      return;
    }

    user = userBody.user;
    models.Group.findOne({
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

      if (!group.owners.includes(actingUser) && user.username != actingUser) {
        callback(403, {
          'message': 'Only group owners can remove members other than themselves.',
        });

        return;
      }

      if (group.owners.length <= 1 && group.owners.includes(user.username)) {
        callback(403, {
          'message': 'The last owner of the group cannot be removed.',
        });

        return;
      }

      // Remove the member from the group
      for (var i = 0; i < group.members.length; i++) {
        if(group.members[i].username == user.username) {
            group.members.splice(i, 1);
            break;
        }
      }

      // If the member was an owner, remove them from the owner list
      for (var i = 0; i < group.owners.length; i++) {
        if(group.owners[i] == user.username) {
          group.members.splice(i, 1);
          break;
      }
      }

      group.save();

      controllers.user.removeGroupLink(
          models, user.username, group._id, function(removeStatus, removeBody) {
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
 * @param {*} models - The mongoose schemas.
 * @param {string} identifier - The group identifier.
 * @param {string} actingUser - The user making the get group request.
 * @param {string} gameProperties - The game properties.
 * @param {function} callback - The callback function.
 */
function addGame(models, identifier, actingUser, gameProperties, callback) {
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

  models.Group.findOneAndUpdate(
    {
      'identifier': identifier,
      'members.username': actingUser,
      'games.name': {'$ne': name},
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
 * @param {*} models - The mongoose schemas.
 * @param {string} identifier - The group identifier.
 * @param {string} actingUser - The user making the get group request.
 * @param {string} gameName - The game name.
 * @param {function} callback - The callback funtion.
 */
function deleteGame(models, identifier, actingUser, gameName, callback) {
  models.Group.findOneAndUpdate({
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
 * @param {*} models - The mongoose schemas.
 * @param {string} identifier - The group identifier.
 * @param {string} actingUser - The user deleting the group.
 * @param {function} callback - The callback function.
 */
function deleteGroup(models, identifier, actingUser, callback) {
  models.Group.findOne({
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

      if (!group.owners.includes(actingUser)) {
        callback(403, {
          'message': 'Only group owners can delete the group.',
        });

        return;
      }
      // First delete this group from all user lists.
      group.members.forEach(function(member) {
        models.User.update(
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
  addMember,
  removeMember,
  addGame,
  deleteGame,
  deleteGroup,
};
