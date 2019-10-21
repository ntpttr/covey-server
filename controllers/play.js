// server/controllers/play.js

/**
 * Records a new play for a group
 * @param {schema} Play - The play mongoose schema
 * @param {schema} Group - The group mongoose schema
 * @param {controller} groupController - The group controller
 * @param {string} actingUser - The user making the get group request
 * @param {String} gameName - The game name
 * @param {String} groupIdent - The group identifier
 * @param {Array} players - The players
 * @param {function} callback = The callback function
 */
function addPlay(Play, Group, groupController, actingUser, gameName, groupIdent, players, callback) {
  groupController.getGroup(Group, groupIdent, actingUser, function(groupStatus, groupBody) {
    if (groupStatus != 200) {
      callback(groupStatus, groupBody);
      return;
    }

    let group = groupBody.group;

    // Check that the requested game to add a play for exists in the group
    let gameInGroup = false;
    group.games.forEach(function(game) {
      if (game.name === gameName) {
        gameInGroup = true;
      }
    });

    if (!gameInGroup) {
      callback(400, {
        'message': "Game " + gameName + " must be added to the group to register plays",
      });
      return;
    }

    play = new Play({
      game: gameName,
      group: groupIdent,
      players: players,
    });
  
    play.save(function(err) {
      if (err) {
        callback(500, {
          'error': err,
        });
        return;
      }
  
      callback(201, {
        'play': play,
      });
    });
  });
}

/**
 * Get all plays for a given group
 * @param {schema} Play - The play mongoose schema
 * @param {schema} Group - The group mongoose schema
 * @param {controller} groupController - The group controller
 * @param {string} actingUser - The user making the get group request
 * @param {String} groupIdent - The group identifier
 * @param {function} callback - The callback function
 */
function getGroupPlays(Play, Group, groupController, actingUser, groupIdent, callback) {
  groupController.getGroup(Group, groupIdent, actingUser, function(groupStatus, groupBody) {
    if (groupStatus != 200) {
      callback(groupStatus, groupBody);
      return;
    }

    Play.find({group: groupIdent}, function(err, plays) {
      if (err) {
        callback(500, {
          'error': err,
        });
        return;
      }

      callback(200, {
        'plays': plays,
      });
    });
  });
}

/**
 * Get all plays for a given user
 * @param {schema} Play - The play mongoose schema
 * @param {String} username - The username to search for
 * @param {function} callback - The callback function
 */
function getUserPlays(Play, username, callback) {
  // TODO: Figure out checking if username is in list of players when querying
  Play.find({user: username}, function(err, plays) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    callback(200, {
      'plays': plays,
    });
  });
}

/**
 * Get all plays for a given user
 * @param {schema} Play - The play mongoose schema
 * @param {schema} Group - The group mongoose schema
 * @param {controller} groupController - The group controller
 * @param {string} actingUser - The user making the get group request
 * @param {String} groupIdent - The group identifier
 * @param {String} playId - The play ID
 * @param {function} callback - The callback function
 */
function deletePlay(Play, Group, groupController, actingUser, groupIdent, playId, callback) {
  groupController.getGroup(Group, groupIdent, actingUser, function(groupStatus, groupBody) {
    if (groupStatus != 200) {
      callback(groupStatus, groupBody);
      return;
    }

    Play.findByIdAndRemove(playId, function(err, play) {
      if (err) {
        callback(500, {
          'error': err,
        });
      } else if (play) {
        callback(200, {
          'message': 'Play deleted successfully',
        });
      } else {
        callback(404, {
          'message': 'Play not found',
        });
      }
    });
  });
}

module.exports = {
  addPlay,
  getGroupPlays,
  getUserPlays,
  deletePlay,
};
